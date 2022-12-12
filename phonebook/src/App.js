import { useState, useEffect } from 'react'
import phonebook from './services/phonebook'

const NOTIFICATION_MS = 5000;

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

const Number = ({person, onDelete}) => {
  return (
    <div>
      {person.name} {person.number}
      <button onClick={onDelete}>delete</button>
    </div>
  )
}

const Persons = ({persons, filter, onDelete}) => {
  console.log("Persons: ", persons)
  return (
    <>
    {
      persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
      .map((person) => (
        <Number key={person.name} person={person} onDelete={onDelete(person.id)}/>
      ))
    }
    </>
  )
}

const Notification = ({text, className}) => {
  let className1="notification";
  if (className) {
    className1 += " " + className;
  }
  return (
    <div className={`notification ${className1}`}>
    {text}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState("")
  const [notificationText, setNotificationText] = useState(null)
  const [notificationClassName, setNotificationClassName] = useState(null)

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

  useEffect(() => {
    if (notificationText) {
      const timeoutid = setTimeout(
        () => {
          setNotificationText(null);
        },
        NOTIFICATION_MS
      )

      // always return a deleter function that can cancel the effect if necessary:
      return () => {
        clearTimeout(timeoutid);
      }
    }
  }, [notificationText]);

  const onFilterChange = (event) => {
    setFilter(event.target.value);
  }

  const onNameChange = (event) => {
    setNewName(event.target.value);
  }

  const onNumberChange = (event) => {
    setNewNumber(event.target.value);
  }

  const notify = (text, className) => {
    setNotificationText(text);
    setNotificationClassName(className);
  }

  const onSubmit = (event) => {
    event.preventDefault();

    // old:
    // if (persons.find(person => person.name === newName) != null) {
    //   window.alert(`${newName} is already added to phonebook`);
    //   return;
    // }

    // new:
    const person = persons.find(person => person.name === newName);
    if (person == null) {
      phonebook.create({name: newName, number: newNumber})
      .then(newPerson => {
        setPersons(persons.concat(newPerson));
        notify(`Added ${newPerson.name}`, "hint");
      })
    } else {
      if (window.confirm(`${person.name} is already in the phonebook. Replace the old number ${person.number} by ${newNumber}?`)) {
        phonebook.update(person.id, {...person, number: newNumber})
        .then(newPerson => {
          setPersons(persons.map(p => p.id === newPerson.id ? newPerson : p));
          notify(`${person.name} has been changed: ${person.number} -> ${newPerson.number}`, "hint");
        })
        .catch(error => {
          notify(`${person.name} has not been found. Probably has been deleted recently.`, "error");
        });
      }
    }

    setNewName("");
    setNewNumber("");
  }

  const onDelete = (id) => (event) => {
    console.log("onDelete ", id);
    let person = null;
    const others = [];
    persons.forEach((cur, i) => {
      if (cur.id === id) {
        person = cur;
      } else {
        others.push(cur);
      }
    });
    console.log("person", person, "others", others);
    if (window.confirm(`Delete ${person.name}?`)) {
      setNotificationText(`Deleting ${person.name} ...`);
      setNotificationClassName("hint");
      phonebook.remove(id)
      .then(() => {
        notify(`${person.name} deleted`, "hint")
      });
      setPersons(others);
    }
  }

  console.log("render with notificationText", notificationText);

  return (
    <div>
      <h2>Phonebook</h2>
      {
        notificationText ? <Notification text={notificationText} className={notificationClassName}/>
        : null
      }
      <Filter filter={filter} onFilterChange={onFilterChange}/>
      <h2>add a new</h2>
      <PersonForm newName={newName} onNameChange={onNameChange} newNumber={newNumber} onNumberChange={onNumberChange} onSubmit={onSubmit}/>
      <h2>Numbers</h2>
      <div>
        <Persons persons={persons} filter={filter} onDelete={onDelete}/>
      </div>
    </div>
  )
}

export default App
