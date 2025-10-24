import { useNavigate } from "react-router-dom";
import '../App.css';

interface Props {
    title: string;
}
 const Card: React.FC<Props> = ({ title }) => {
  const navigate = useNavigate()

  const handleClick = (title: string) => {
    title.toLowerCase();
    // Navigate to /bill when card is clicked
    navigate('/'+title.toLowerCase())
  }

  return (
    <div className="card" onClick={() => handleClick(title)}>
      <h3 className="card__title">{title}</h3>
    </div>
  )
}

export default Card;