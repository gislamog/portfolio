import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ProjectDetails.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const SierpinskiTriangleGame = ({ pointThickness, numOfPointsDrawn, reset }) => {
    const [cells, setCells] = useState([]);
    const [currCell, setCurrCell] = useState(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState(500);

    // Function to calculate the triangle's vertices based on canvas size
    const calculatePoints = (size) => {
        return [
            { x: size / 2, y: size * 0.1 },
            { x: size * 0.1, y: size * 0.9 }, 
            { x: size * 0.9, y: size * 0.9 }
        ];
    };

    useEffect(() => {
        // Resize canvas based on screen size
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCanvasSize(window.innerWidth * 0.9);
            } else {
                setCanvasSize(500);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const points = calculatePoints(canvasSize);
        setCells(points);
        setCurrCell(null);
        cancelAnimationFrame(animationRef.current);
    }, [reset, canvasSize]);

    const getRandomPoint = () => {
        const points = calculatePoints(canvasSize);
        return points[Math.floor(Math.random() * points.length)];
    };

    const getMidPoint = (point1) => {
        const point2 = getRandomPoint();
        return {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2,
        };
    };

    const drawPoints = useCallback(() => {
        if (currCell) {
            const newCells = [];
            for (let i = 0; i < numOfPointsDrawn; i++) {
                const newCell = getMidPoint(currCell);
                newCells.push(newCell);
                setCurrCell(newCell);
            }
            setCells((prevCells) => [...prevCells, ...newCells]);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';

            newCells.forEach((cell) => {
                ctx.beginPath();
                ctx.arc(cell.x, cell.y, pointThickness, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        animationRef.current = requestAnimationFrame(drawPoints);
    }, [currCell, pointThickness, numOfPointsDrawn, canvasSize]);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(drawPoints);
        return () => cancelAnimationFrame(animationRef.current);
    }, [drawPoints]);

    const handleMouseClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newCell = { x: mouseX, y: mouseY };
        setCells((prevCells) => [...prevCells, newCell]);
        setCurrCell(newCell);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        cells.forEach((cell) => {
            ctx.beginPath();
            ctx.arc(cell.x, cell.y, pointThickness, 0, 2 * Math.PI);
            ctx.fill();
        });
    }, [cells, pointThickness]);

    return (
        <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', maxWidth: '100%' }}
            onClick={handleMouseClick}
        />
    );
};


const SierpinskiTriangle = () => {
    const navigate = useNavigate();
    const [pointThickness, setPointThickness] = useState(2);
    const [delayTime, setDelayTime] = useState(1);
    const [numOfPointsDrawn, setNumOfPointsDrawn] = useState(100);
    const [reset, setReset] = useState(false);

    const handleRestart = () => {
        setReset(!reset);
    };

    // to scroll to top of this page when user clicks on it in Projects page
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="project-detail">
            <div className="section">

                <div className="details-header-wrapper">
                    <button onClick={() => navigate(-1)} className="back-button">Back</button>
                    <div className="section-header">Sierpinski's Triangle</div>
                </div>

                {/* Interactive Game */}
                <div>
                    <SierpinskiTriangleGame
                        pointThickness={pointThickness}
                        delayTime={delayTime}
                        numOfPointsDrawn={numOfPointsDrawn}
                        reset={reset}
                        className="triangle-game"
                    />
                </div>

                <div className="controls">
                    <button onClick={handleRestart} className="restart-button">Restart</button>
                    <div className="form-group">
                        <label>Point Thickness (1-10):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={pointThickness}
                            min="1"
                            max="10"
                            onChange={(e) => setPointThickness(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Delay Time (1-200ms):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={delayTime}
                            min="1"
                            max="200"
                            onChange={(e) => setDelayTime(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Number of Points Drawn (1-1000):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={numOfPointsDrawn}
                            min="1"
                            max="1000"
                            onChange={(e) => setNumOfPointsDrawn(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="sub-header">Project Description</div>
                <p className="project-description">
                    Originally created in Java, this project was rewritten in React for this site.
                    To create a Sierpinski Triangle, you start by placing 3 dots at the vertices of a triangle.
                    Then, you add a dot anywhere within the triangle.
                    Next, you place another dot at the midpoint between the last dot and one of the triangle's vertices.
                    Repeating this process indefinitely will always produce the same triangular pattern.
                </p>

                <div className="sub-header">Technologies Used</div>
                <ul className="technologies-used">
                    <li>Java</li>
                    <li>React.js</li>
                </ul>

                <div className="sub-header">Sample Code</div>
                <p className="project-description">
                    This Java code creates a GUI application to display Sierpinski's Triangle.
                    It initializes three main points and updates the triangle by calculating midpoints between the current point and these main points.
                    The user can click to set the initial point, and the triangle updates and draws points at regular intervals.
                </p>

                <pre className="code-block">
                    {`package GUI;

import java.awt.Color;
import java.awt.EventQueue;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.Timer;

import Menu.Cell;
import Menu.constants;
import Menu.logicMenu;

// CREATES GUI. CREATES MAIN 3 POINTS. 
// CALCULATES MOUSECLICK AS 1ST POINT.
// ADDS SURFACE() TO FRAME (MAKES IT DO LABOR OF DRAWING POINTS ON GUI)

public class mainGUI extends JPanel implements ActionListener{
	private List<Cell> cells;	//arrayList of cells that will be displayed
	private Cell currCell;	//starts null, instantiated by user's mouse click
	private logicMenu logic;	
	private Timer timer;
	
	public mainGUI() {
		System.out.println("Entered Constructor");
		
		this.cells = new ArrayList<>();
		this.currCell = null;
		this.logic = new logicMenu();
		
		cells.add(constants.p1);
		cells.add(constants.p2);
		cells.add(constants.p3);
		
		this.setBackground(Color.gray);
		
		//CREATES DELAY (milliseconds) WHEN DISPLAYING DOTS
		timer = new Timer(constants.delayTime, this);
		timer.start();
		
		//ENABLES USER TO CLICK MOUSE ON SCREEN FOR INPUT
		addMouseListener(new MouseAdapter() {
			@Override
			public void mousePressed(MouseEvent e) {
				int mouseX = e.getX();
				int mouseY = e.getY();
				currCell = new Cell(mouseX, mouseY);	//create new cell, set it equal to mouse click input
				cells.add(currCell);				// add new cell to arraylist of cells
				repaint();
			}
		});
	}
		
	@Override
	public void paint(Graphics g) {

		super.paint(g);		//needed to set background color
		Graphics g2 = (Graphics2D) g;	
		g2.setColor(Color.black);	//sets dot color
		
		// iterates through arrayList of cells. Without iteration,
		// the points would move (animate) rather than keeping the 
		// old dots too.
		for (Cell c : cells) {
			g2.fillOval(c.getX(), c.getY(), constants.pointThickness, constants.pointThickness);
		}
	}

	// EVERTYING HERE WILL OCCUR BETWEEN DELAY TIME IN TIMER
	public void actionPerformed(ActionEvent e) {

		// currCell is null before user clicks with their mouse. Error
		// will occur if repaint() is attempted while argument currCell
		// is null. if statement is necessary to prevent runtime exception.
		
		if (currCell != null) {

			// add desired number of cells to arraylist, based on midPoint()
			
			for (int i = 0; i < constants.numOfPointsDrawn; i++) {
				currCell = logic.midPoint(currCell);
				cells.add(currCell);
			}
		}
		repaint();
	}
	
	public void runGUI() {
	    System.out.println("Entered runGUI");
	    
	    EventQueue.invokeLater(new Runnable(){
	    	@Override
	    	public void run(){
	    		JFrame frame = new JFrame();
	    		frame.add(new mainGUI());
	    		frame.setTitle("Sierpinkski's Triangle");
	    		frame.setSize(constants.displaySize, constants.displaySize);
	    		frame.setLocationRelativeTo(null);		//opens frame in middle of screen
	    		frame.setVisible(true);
	    	}
	    });
	    
	    System.out.println("Exit runGUI");
	}
}
`}
                </pre>
            </div>
        </div>
    );
};

export default SierpinskiTriangle;
