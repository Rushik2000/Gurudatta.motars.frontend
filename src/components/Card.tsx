import { useNavigate } from "react-router-dom";
import '../App.css';

interface Props {
    title: string;
    imgPath: string
}
 const Card: React.FC<Props> = ({ title, imgPath }) => {
  const navigate = useNavigate()

  const handleClick = (title: string) => {
    title.toLowerCase();
    // Navigate to /bill when card is clicked
    navigate('/'+title.toLowerCase())
  }

  return (
    <div className="card" onClick={() => handleClick(title)}>
      <img src={imgPath} className="card_image" />
      <h2>{title}</h2>
    </div>
  )
}

export default Card;