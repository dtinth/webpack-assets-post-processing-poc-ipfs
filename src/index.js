import './index.css'
import('./component').then(({ component }) => {
  document.body.appendChild(component())
})
