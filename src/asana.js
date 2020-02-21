'use strict'

const Asana = require('asana')
const Story = require('./Story')

let asana
let sourceDepartment

// ----------------------------------------------------------------------------
// Initialize Asana client
// ----------------------------------------------------------------------------
exports.init = function(token, department) {
    asana = Asana.Client.create().useAccessToken(token)
    sourceDepartment = department
}

// ----------------------------------------------------------------------------
// Get all tasks for the given Asana project and store the
// relevant bits of data within a `Story` Object
// ----------------------------------------------------------------------------
exports.getTasks = async function(projectId) {
    let stories = []
    let tasks = await asana.tasks.findByProject(projectId)
    tasks = await tasks.fetch()

    for (const t of tasks) {
        let task = await getTaskDetails(t.gid)
        const asanaDepartment = getCustomField(task, "Department")

        if (task && !task.completed && asanaDepartment === sourceDepartment) {
            const story = convertTaskToStory(projectId, task)
            stories.push(story)
        }
    }

    return stories
}

// ----------------------------------------------------------------------------
// Get all subtaks for the given Asana task. Only the name will be
// used as the description for the Clubhouse Story task.
// ----------------------------------------------------------------------------
exports.getSubtasks = async function(story) {
    let storyTasks = []
    let subtasks = await asana.tasks.subtasks(story.asanaId)

    for (const st of subtasks.data) {
        let subtask = await getTaskDetails(st.gid)
        if (subtask && !subtask.completed) {
            storyTasks.push({ description: subtask.name })
        }
    }

    return storyTasks
}

// ----------------------------------------------------------------------------
// Asana calls all comments and status changes on a Task a 'Story'
// ----------------------------------------------------------------------------
exports.getComments = async function(story) {
    let storyComments = []
    let asanaStories = await asana.tasks.stories(story.asanaId)

    for (const s of asanaStories.data) {
        if (s.type === 'comment') {
            storyComments.push({ text: s.text })
        }
    }

    return storyComments
}

// ----------------------------------------------------------------------------
// Get the task details, but ignore tasks that are sections
// ----------------------------------------------------------------------------
async function getTaskDetails(taskId) {
    const task = await asana.tasks.findById(taskId)

    return task.resource_subtype !== 'section' ? task : null
}

function convertTaskToStory(projectId, task) {
    const points = getCustomField(task, "Points")

    return new Story({
        asanaId: task.gid,
        external_id: `https://app.asana.com/0/${projectId}/${task.gid}`,
        name: task.name,
        description: task.notes,
        estimate: !points ? null : parseInt(points)
    })
}

function getCustomField(task, fieldName) {
    if (!task.custom_fields) {
        return null
    }

    const customField = task.custom_fields.find(
        element => element.name === fieldName,
    )

    if (customField && customField.enum_value && customField.enum_value.name) {
        return customField.enum_value.name
    }

    return null
}
