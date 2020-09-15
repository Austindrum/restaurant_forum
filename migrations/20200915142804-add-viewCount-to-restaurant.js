'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Restaurants", "viewCount", {
      type: Sequelize.INTEGER,
      defaultValue: 0
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Restaurants", "viewCount");
  }
};
