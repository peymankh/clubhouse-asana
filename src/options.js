'use strict'

module.exports = Object.freeze([
  {
    flag: '-f, --from <asanaProjectId>',
    description: 'Source Asana project to import from'
  },
  {
    flag: '-t, --to <clubhouseProjectId>',
    description: 'Destination Clubhouse project to export to'
  },
  {
    flag: '-d, --sourceDepartment <sourceDepartment>',
    description: 'Custom Source Department'
  },
  {
    flag: '--asana-token <asanaToken>',
    description: 'Personal token for accessing Asana API'
  },
  {
    flag: '--clubhouse-token <clubhouseToken>',
    description: 'Auth token for accessing Clubhouse API'
  }
])
