/*
 * global helper for chai.should()
 */
import util from 'util'
import chai from 'chai'

GLOBAL.should = chai.should()
GLOBAL.expect = chai.expect // to work with 'undefined' - should cant it
GLOBAL.assert = chai.assert

GLOBAL.inspect = (item) => {
  return util.inspect(item, true, null, true)
}
