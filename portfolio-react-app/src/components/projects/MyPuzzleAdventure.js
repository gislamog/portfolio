import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ProjectDetails.css';
import MyPuzzleAdventure1 from '../../images/projects/my-puzzle-adventure/MyPuzzleAdventure1.png';
import MyPuzzleAdventure2 from '../../images/projects/my-puzzle-adventure/MyPuzzleAdventure2.png';
import MyPuzzleAdventure3 from '../../images/projects/my-puzzle-adventure/MyPuzzleAdventure3.png';
import MyPuzzleAdventure4 from '../../images/projects/my-puzzle-adventure/MyPuzzleAdventure4.png';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';

const MyPuzzleAdventure = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="project-detail">
            <button onClick={() => navigate(-1)} className="back-button">Back</button>
            <div className="project-details-header">My Puzzle Adventure</div>

            <Carousel>
                <Carousel.Item>
                    <img className="d-block w-100" src={MyPuzzleAdventure1} alt="My Puzzle Adventure 1" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100" src={MyPuzzleAdventure2} alt="My Puzzle Adventure 2" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100" src={MyPuzzleAdventure3} alt="My Puzzle Adventure 3" />
                </Carousel.Item>
                <Carousel.Item>
                    <img className="d-block w-100" src={MyPuzzleAdventure4} alt="My Puzzle Adventure 4" />
                </Carousel.Item>
            </Carousel>

            <div className="project-subheader">Project Description</div>
            <p className="project-description">
                My Puzzle Adventure is a personal project developed using Java. It features 2D pixel art graphics made by myself, creating a nostalgic experience. The gameplay combines exploration, puzzle-solving, and combat within a labyrinth environment.
            </p>

            <div className="project-subheader">Technologies Used</div>
            <ul className="technologies-used">
                <li>Java</li>
                <li>Eclipse</li>
            </ul>

            <div className="project-subheader">Sample Code</div>

            <p className="project-description">
                This code snippet is part of the CollisionChecker class, which is responsible for detecting collisions between the player or other entities and the tiles in the game world. The checkTile method calculates the entity's position and checks if it collides with any tiles based on its current direction and speed.
            </p>


            <pre className="code-block">
                {`public void checkTile(Entity entity) {
    int entityLeftWorldX = entity.worldX + entity.solidArea.x;
    int entityRightWorldX = entity.worldX + entity.solidArea.x + entity.solidArea.width;
    int entityTopWorldY = entity.worldY + entity.solidArea.y;
    int entityBottomWorldY = entity.worldY + entity.solidArea.y + entity.solidArea.height;
    
    int entityLeftCol = entityLeftWorldX / gp.tileSize;
    int entityRightCol = entityRightWorldX / gp.tileSize;
    int entityTopRow = entityTopWorldY / gp.tileSize;
    int entityBottomRow = entityBottomWorldY / gp.tileSize;
    
    int tileNum1, tileNum2;
    
    switch(entity.direction) {
    case "up": 
        entityTopRow = (entityTopWorldY - entity.speed) / gp.tileSize;
        tileNum1 = gp.tileM.mapTileNum[gp.currLevel][entityLeftCol][entityTopRow];
        tileNum2 = gp.tileM.mapTileNum[gp.currLevel][entityRightCol][entityTopRow];
        break;
    case "down":
        entityBottomRow = (entityBottomWorldY + entity.speed) / gp.tileSize;
        tileNum1 = gp.tileM.mapTileNum[gp.currLevel][entityLeftCol][entityBottomRow];
        tileNum2 = gp.tileM.mapTileNum[gp.currLevel][entityRightCol][entityBottomRow];
        break;
    case "left":
        entityLeftCol = (entityLeftWorldX - entity.speed) / gp.tileSize;
        tileNum1 = gp.tileM.mapTileNum[gp.currLevel][entityLeftCol][entityTopRow];
        tileNum2 = gp.tileM.mapTileNum[gp.currLevel][entityLeftCol][entityBottomRow];
        break;
    case "right":
        entityRightCol = (entityRightWorldX + entity.speed) / gp.tileSize;
        tileNum1 = gp.tileM.mapTileNum[gp.currLevel][entityRightCol][entityTopRow];
        tileNum2 = gp.tileM.mapTileNum[gp.currLevel][entityRightCol][entityBottomRow];
        break;
    default:
        tileNum1 = tileNum2 = 0;
    }
    
    if (gp.tileM.tile[tileNum1].collision || gp.tileM.tile[tileNum2].collision) {
        entity.collisionOn = true;
    }
}`}
            </pre>
            
        </div>
    );
};

export default MyPuzzleAdventure;
