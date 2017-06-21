"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Message storage
 *
 * Store messages and represent its by query
 */
var MAX_STORAGE_SIZE = 1024; // maximum size for REPRESENT result

var Keeper = function () {
  function Keeper(maxStorageSize) {
    _classCallCheck(this, Keeper);

    this.maxStorageSize = maxStorageSize || MAX_STORAGE_SIZE; // maximum size for REPRESENT result
    this.storage = []; // online storage
    this.archStorage = []; // archive storage extender
    this.counter = 0;
  }

  /*
   * Set maximum size for REPRESENT result
   */


  _createClass(Keeper, [{
    key: "setMaxStorageSize",
    value: function setMaxStorageSize(maxStorageSize) {
      this.maxStorageSize = maxStorageSize;
    }

    /*
     * Save message
     */

  }, {
    key: "saveMessage",
    value: function saveMessage(message) {
      var currentSize = void 0;

      // add internal fields
      message.id = this.getNewCount();
      message.timestamp = +new Date();
      currentSize = this.storage.push(message);
      if (currentSize >= this.maxStorageSize) {
        this.doRotateStorage();
      }
    }

    /*
     * Return saved messages
     */

  }, {
    key: "getMessages",
    value: function getMessages() {
      var currentSize = this.storage.length;

      return this.archStorage.slice(currentSize).concat(this.storage);
    }

    /*
     * Return max message id
     */

  }, {
    key: "getLastId",
    value: function getLastId() {
      return this.counter;
    }

    /*
     * Storage rotator
     *
     * fast but memory cost
     */

  }, {
    key: "doRotateStorage",
    value: function doRotateStorage() {
      this.archStorage = this.storage;
      this.storage = [];
    }

    /*
     * Return new (incremented) counter
     */

  }, {
    key: "getNewCount",
    value: function getNewCount() {
      this.counter += 1;
      return this.counter;
    }
  }]);

  return Keeper;
}();

exports.default = Keeper;