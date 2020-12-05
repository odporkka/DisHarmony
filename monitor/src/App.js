import React from "react"

const App = () => {
  let nodes = [
    { name: 'node1', id: 1 },
    { name: 'node2', id: 2 },
    { name: 'node3', id: 3 }
  ]

  return (
    <div className="App">
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <header>
              <h1>DisHarmony monitor</h1>
            </header>
          </div>
        </div>
        <div className='row'>
          { nodes.map(n => (
              <div className='col' key={n.id}>
                <h4>{n.name}</h4>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default App
