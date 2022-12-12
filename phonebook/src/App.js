import { useState, useEffect } from 'react'
import phonebook from './services/phonebook'

const Filter = ({filter, onFilterChange}) => {
  return (
    <>
    filter shown with <input value={filter} onChange={onFilterChange} />
    </>
  )

}
const PersonForm = ({newName, newNumber, onNameChange, onNumberChange, onSubmit}) => {
  return (
    <form>
      <div>
        name: <input value={newName} onChange={onNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={onNumberChange} />
      </div>
      <div>
        <button type="submit" onClick={onSubmit}>add</button>
      </div>
    </form>
  )
}

const Number = ({person}) => {
  return (
    <div>
      {person.name} {person.number}
    </div>
  )
}

const Persons = ({persons, filter}) => {
  console.log("Persons: ", persons)
  return (
    <>
    {
      persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
      .map((person) => (
        <Number key={person.name} person={person}/>
      ))
    }
    </>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState("")

  useEffect(() => {
    const hasCanceled = {
      canceled: false
    }
    phonebook.getAll()
    .then(persons1 => {
      if (hasCanceled.canceled) {
        console.log("return because canceled");
        return;
      }
      console.log("set fetched persons");
      setPersons(persons1);
    })
    console.log("started fetching data...");

    return () => {
      console.log("canceling axios.get(...)");
      hasCanceled.canceled = true;
    }
  }, [])

  const onFilterChange = (event) => {
    setFilter(event.target.value);
  }

  const onNameChange = (event) => {
    setNewName(event.target.value);
  }

  const onNumberChange = (event) => {
    setNewNumber(event.target.value);
  }

  const onSubmit = (event) => {
    event.preventDefault();

    if (persons.find(person => person.name === newName) != null) {
      window.alert(`${newName} is already added to phonebook`);
      return;
    }

    phonebook.create({name: newName, number: newNumber})
    .then(newPerson => {
      setPersons(persons.concat(newPerson));
    })
    setNewName("");
    setNewNumber("");
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} onFilterChange={onFilterChange}/>
      <h2>add a new</h2>
      <PersonForm newName={newName} onNameChange={onNameChange} newNumber={newNumber} onNumberChange={onNumberChange} onSubmit={onSubmit}/>
      <h2>Numbers</h2>
      <div>
        <Persons persons={persons} filter={filter}/>
      </div>
    </div>
  )
}

export default App
