document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const scoreDisplay = document.querySelector('#score')
    const linesDisplay = document.querySelector('#lines_count')
    const startBtn = document.querySelector('#start-button')
    const width = 10
    let score = 0
    let lines_count = 0
    let timeID
    const colors = [
        'firebrick',
        'yellowgreen',
        'coral',
        'seagreen',
        'orange',
        'teal',
        'blueviolet'
    ]

    // 7 tetrominoes of different shape along with their rotations
    const rlt = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ]

    const lt = [
        [0, 1, width+1, width*2+1],
        [width, width+1, width+2, width*2],
        [0, width, width*2, width*2+1],
        [width*2, width*2+1, width*2+2, width+2]
    ]

    const rzt = [
        [width+1, width+2, width*2+1, width*2],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2+1, width*2],
        [0, width, width+1, width*2+1]
    ]

    const zt = [
        [width, width+1, width*2+1, width*2+2],
        [1, width+1, width, width*2],
        [width, width+1, width*2+1, width*2+2],
        [1, width+1, width, width*2]
    ]

    const tt = [
        [1, width, width+1, width+2],
        [1, width+1, width*2+1, width+2],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ]

    const ot = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ]

    const it = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ]
    
    const tetrominoes = [rlt, lt, rzt, zt, tt, ot, it]
    let curPos = 0
    let curRot = 0
    let rndT = 0
    let nextRnd = 0
    let curT = 0

    // randomly select a tetromino and put its first rotation in the initial position
    function setNew() {
        curPos = 4
        rndT = nextRnd
        nextRnd = Math.floor(Math.random()*tetrominoes.length)
        curT = tetrominoes[rndT][curRot]
    }
    
    setNew()

    // draw the tetromino
    function draw() {
        curT.forEach(index => {
            squares[curPos + index].classList.add('tetromino')
            squares[curPos + index].style.backgroundColor = colors[rndT]
        })
    }

    // undraw the tetromino
    function undraw() {
        curT.forEach(index => {
            squares[curPos + index].classList.remove('tetromino')
            squares[curPos + index].style.backgroundColor = ''
        })
    }

    // map functions to keycodes
    function control(e) {
        switch(e.keyCode) {
            case 37:
                moveLeft()
                break
            case 38:
                rotate()
                break
            case 39:
                moveRight()
                break
            case 40:
                moveDown()
                break
        }
    }
    document.addEventListener('keydown', control)

    // move down the tetromino
    function moveDown() {
        undraw()
        curPos += width
        draw()
        freeze()
    }

    // freeze the tetromino as it reaches the bottom line
    function freeze() {
        if (curT.some(index => squares[curPos + index + width].classList.contains('taken'))) {
            curT.forEach(index => squares[curPos + index].classList.add('taken'))
            setNew()
            draw()
            displayShape()
            addScore()
            gameOver()
        }
    }

    // move the tetromino left unless it is at the edge or there is an obstacle
    function moveLeft() {
        undraw()
        const reachedLeftEdge = curT.some(index => (curPos + index) % width === 0)
        if (!reachedLeftEdge) curPos -= 1
        if (curT.some(index => squares[curPos + index].classList.contains('taken'))) {
            // if the position has been taken by another figure, push the tetromino back
            curPos += 1
        }
        draw()
    }

    // move the tetromino right unless it is at the edge or there is a blockage
    function moveRight() {
        undraw()
        const reachedRightEdge = curT.some(index => (curPos + index) % width === width - 1)
        if (!reachedRightEdge) curPos += 1
        if (curT.some(index => squares[curPos + index].classList.contains('taken'))) {
            // if the position has been taken by another figure, push the tetromino back
            curPos -= 1 
        }
        draw()
    }

    // rotate the tetromino
    function rotate() {
        undraw()
        const prevRot = curRot
        curRot ++
        if (curRot === curT.length) curRot = 0
        curT = tetrominoes[rndT][curRot]

        const reachedLeftEdge = curT.some(index => (curPos + index) % width === 0)
        const reachedRightEdge = curT.some(index => (curPos + index) % width === width - 1)
        const overlap = curT.some(index => squares[curPos + index].classList.contains('taken'))
        if (reachedLeftEdge && reachedRightEdge || overlap) {
            curRot = prevRot
            curT = tetrominoes[rndT][curRot]
        }
        draw()
    }

    // show an upcoming tetromino in the mini-grid window
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayW = 5
    const displayIndex = 0
    // rlt, lt, rzt, zt, tt, ot, it
    const nextTs = [
        [displayW+1, displayW*2+1, displayW*2+2, displayW*2+3],
        [displayW+3, displayW*2+1, displayW*2+2, displayW*2+3],
        [displayW+2, displayW+3, displayW*2+1, displayW*2+2],
        [displayW+1, displayW+2, displayW*2+2, displayW*2+3],
        [displayW*2+1, displayW*2+2, displayW*2+3, displayW+2],
        [displayW+1, displayW+2, displayW*2+1, displayW*2+2],
        [2, displayW+2, displayW*2+2, displayW*3+2]
    ]

    // display the shape of next tetromino in the mini-grid
    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        nextTs[nextRnd].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino')
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRnd]
        })
    }

    // add functionality to the start button
    startBtn.addEventListener('click', () => {
        if (timeID) {
            // the pause option
            clearInterval(timeID)
            timeID = null
        } else {
            // the start option
            draw()
            // move the tetromino down every second
            timeID = setInterval(moveDown, 1000)
            nextRnd = Math.floor(Math.random()*tetrominoes.length)
            displayShape()
        }
    })

    // calculate the player's score
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = Array.from(new Array(width), (a,b) => b + i)
            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                lines_count += 1
                scoreDisplay.innerHTML = score
                linesDisplay.innerHTML = lines_count
                row.forEach(index => {
                    squares[index].classList.remove('taken', 'tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    // game over
    function gameOver() {
        if (curT.some(index => squares[curPos + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = ' end... '
            clearInterval(timeID)
        }
    }
})