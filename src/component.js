import './component.css'
import _ from 'lodash'

export function component() {
  let element = document.createElement('div')
  element.innerHTML = _.join(['Hello', 'webpack'], ' ')
  return element
}
