/*
 * Legacy helpers suite
 */
import { has } from './helper'

/*
 * Check all options are valid
 */
const checkOptions = (options) => {
  if(!(has(options, 'layer') && has(options, 'name') && has(options, 'service') && has(options, 'acl'))){
    throw TypeError('Wrong legacy service registration, halt!')
  }
  if(!has(options.service, 'getServiceConfig')){
    throw TypeError('Wrong legacy service, |getServiceConfig| not found, halt!')
  }
}

export default {checkOptions}
