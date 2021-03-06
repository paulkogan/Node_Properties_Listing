
// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('./propconfig');

const options = {
  user: config.get('MYSQL_USER'),
  password: config.get('MYSQL_PASSWORD'),
  database: 'bookshelf'  //the DB is bookshelf, table is books
};

if (config.get('INSTANCE_CONNECTION_NAME') && config.get('NODE_ENV') === 'production') {
  options.socketPath = `/cloudsql/${config.get('INSTANCE_CONNECTION_NAME')}`;
}

//where is the concept of a proxy?
const connection = mysql.createConnection(options);

// [START list]
//   getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
function list (cb) {
  connection.query(
    'SELECT * FROM reprops',  function(err, results) {
              if (err) {
                cb(err);
                return;
              }
              //const hasMore = false;
              //wow, you just invoke the CB function to return results
              cb(null, results, false);
    }
  );
}
// [END list]

// [START create]
function create (data, cb) {
  console.log("the new property is: "+JSON.stringify(data))
  connection.query('INSERT INTO reprops SET ?', data, (err, res) => {
    if (err) {
      console.log("bad insert"+err)
      cb(err);
      return;
    }
    //***** why is read a function but cb is not??
    //and why do a read here??
    //and  the insert gives back an insertId?? 
    //this lets you pass back a record to display after insert
    //!! and you pass is the CB function you need to fill
   read(res.insertId, cb);
    //cb(null, res);
  });
}
// [END create]

function read (id, cb) {
  connection.query(
    'SELECT * FROM reprops WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}

// [START update]
function update (id, data, cb) {
  connection.query(
    'UPDATE `books` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      read(id, cb);
    });
}
// [END update]

// function _delete (id, cb) {
//   connection.query('DELETE FROM `books` WHERE `id` = ?', id, cb);
// }


function  _delete (id, cb) {
  connection.query('DELETE FROM reprops WHERE `id` = ?', id, (err, results) => {
      if (err) {
        console.log("bad delete "+err)
        cb(err);
        return;
      }
      console.log("Delete results in model are: "+JSON.stringify(results))
      cb(null, results)
  });

}





module.exports = {
  //createSchema: createSchema,
  list: list,
  create: create,
  read: read,
  update: update,
  delete: _delete
};

if (module === require.main) {
  const prompt = require('prompt');
  prompt.start();

  console.log(
    `Running this script directly will allow you to initialize your mysql database.
    This script will not modify any existing tables.`);

  prompt.get(['user', 'password'], (err, result) => {
    if (err) {
      return;
    }
    //createSchema(result);
  });
}


