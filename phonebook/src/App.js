import { useState } from 'react'

const Number = ({person}) => {
  return (
    <div>
      {person.name}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas' }
  ])
  const [newName, setNewName] = useState('')

  const onNameChange = (event) => {
    setNewName(event.target.value);
  }

  const onSubmit = (event) => {
    event.preventDefault();
    const newPersons = persons.slice();
    newPersons.push({
      name: newName
    });
    setPersons(newPersons);
    setNewName("");
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <form>
        <div>
          name: <input value={newName} onChange={onNameChange} />
        </div>
        <div>
          <button type="submit" onClick={onSubmit}>add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      <div>
        {persons.map((person) => (
          <Number key={person.name} person={person}/>
        ))}
      </div>
    </div>
  )
}

export default App
