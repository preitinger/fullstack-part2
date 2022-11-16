const Total = ({parts}) => {
  return (
    <p><strong>
    Number of exercises {
      parts.reduce((sum, part) => sum + part.exercises, 0)
    }
    </strong></p>
  );
}

export default Total
