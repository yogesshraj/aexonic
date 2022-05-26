'use strict';

const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/db_config')[env];
const logger = require('../utilities/logger');

const { Client } = require('pg');

if (process.env.NODE_ENV !== 'test') {
	console.log(`Node environment: ${process.env.NODE_ENV}`);
	console.log(`database: ${config.database}`);
	console.log(`username: ${config.username}`);
	console.log(`host: ${config.host}`);
}

exports.create_db_if_does_not_exist = async () => {
	try {
		const client = new Client({
			user: config.username,
			host: config.host,
			password: config.password,
			port: 5432,
		});
		await client.connect();
		await execute_query(client, `CREATE DATABASE ${config.database}`);
		await client.end();
	} catch (error) {
		logger.log(error.message);
	}
};

async function execute_query(client, query) {
	try {
		await client.query(query);
	} catch (error) {
		logger.log(error.message);
	}
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
	host: config.host,
	dialect: config.dialect,
	pool: {
		max: config.pool.max,
		min: config.pool.min,
		acquire: config.pool.acquire,
		idle: config.pool.idle,
	},
	logging: false, //TODO: Please provide a function here to handle logging...
});

exports.migrate_database = async () => {
	try {
		const execSync = require('child_process').execSync;
		var output = execSync('npx sequelize-cli db:migrate');
		console.log('Database migrated successfully!\n');
	} catch (error) {
		console.log(error.message);
	}
};

exports.drop_db_forcefully = async () => {
	try {
		const client = new Client({
			user: config.username,
			host: config.host,
			password: config.password,
			port: 5432,
		});
		await client.connect();
		await execute_query(client, `DROP DATABASE IF EXISTS ${config.database}`);
		await client.end();
	} catch (error) {
		logger.log(error.message);
	}
};

module.exports.Sequelize = Sequelize;
module.exports.sequelize = sequelize;
