import { useNavigate } from "react-router-dom";
import styles from '../css/Card.module.css'

interface Props {
    title: string;
    imgPath: string
}
 export const Card: React.FC<Props> = ({ title, imgPath }) => {
  const navigate = useNavigate()

  const handleClick = (title: string) => {
    title.toLowerCase();
    // Navigate to /bill when card is clicked
    navigate('/'+title.toLowerCase())
  }

  return (
    <div className={styles.card} onClick={() => handleClick(title)}>
      <img src={imgPath} className={styles.cardimage} />
      <h2>{title}</h2>
    </div>
  )
}