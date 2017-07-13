/*
 * global helper for chai.should()
 */
import util from 'util'
import chai from 'chai'

global.should = chai.should()
global.expect = chai.expect // to work with 'undefined' - should cant it
global.assert = chai.assert

global.inspect = (item) => {
  return util.inspect(item, true, null, true)
}
