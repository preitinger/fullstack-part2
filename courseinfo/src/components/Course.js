// Forgive me, as recommended in part 2, I created a module for every component:

import Header from './Header'
import Content from './Content'
import Total from './Total'

const Course = ({course}) => {
  return (
    <div>
      <Header text={course.name}/>
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  )
}

export default Course
