import axios from 'axios';
const baseUrl = 'http://localhost:3001/persons'

const data = (request) => {
  return request.then(response => response.data)
}

const getAll = () => {
  return data(axios.get(baseUrl))
}

const create = newObject => {
  return data(axios.post(baseUrl, newObject))
}

const update = (id, newObject) => {
  return data(axios.put(`${baseUrl}/${id}`, newObject))
}

const phonebook = {getAll, create, update}
export default phonebook;
