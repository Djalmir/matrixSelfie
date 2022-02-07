const canvas = document.querySelector('#canvas')
const c = canvas.getContext('2d')

canvas.width = 477
canvas.height = 523
let imgCoordinates
let particleArray = []

const mouse = {
	x: undefined,
	y: undefined,
	radius: 0
}

function mousemove(e) {
	let bounds = canvas.getBoundingClientRect()
	if (e.touches) {
		mouse.x = (e.touches[e.touches.length - 1].clientX - bounds.x) * screenAdjustX
		mouse.y = (e.touches[e.touches.length - 1].clientY - bounds.y) * screenAdjustY
	}
	else {
		mouse.x = (e.x - bounds.x) * screenAdjustX
		mouse.y = (e.y - bounds.y) * screenAdjustY
	}
	mouse.radius = canvas.width / 3
}

window.addEventListener('mousemove', mousemove)
window.addEventListener('touchmove', mousemove)

window.addEventListener('mouseout', () => {
	mouse.x = undefined
	mouse.y = undefined
})
window.addEventListener('touchend', () => {
	mouse.x = undefined
	mouse.y = undefined
})

function setAdjusts() {
	screenAdjustX = canvas.width / canvas.offsetWidth
	screenAdjustY = canvas.height / canvas.offsetHeight
	mouse.radius = canvas.width / 3
}
setAdjusts()

window.addEventListener('resize', setAdjusts)

class Particle {
	constructor(x, y, color) {
		this.x = (canvas.width / 2 - 255) + x
		this.y = (canvas.height / 2 - 230) + y
		this.size = .85 * canvas.width / 100
		this.baseX = this.x
		this.baseY = this.y
		this.density = (Math.random() * 100) + 50
		this.color = color
	}

	draw() {
		c.fillStyle = this.color

		// c.beginPath()
		// c.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
		// c.closePath()
		// c.fill()

		c.fillRect(this.x, this.y, this.size, this.size)
	}

	update() {
		let dx = mouse.x - this.x
		let dy = mouse.y - this.y
		let distance = Math.sqrt(dx * dx + dy * dy)

		let forceDirectionX = dx / distance
		let forceDirectionY = dy / distance

		let maxDistance = mouse.radius
		let force = (maxDistance - distance) / maxDistance
		let directionX = forceDirectionX * force * this.density
		let directionY = forceDirectionY * force * this.density

		if (distance < mouse.radius) {
			this.x -= directionX
			this.y -= directionY
			// this.color = '#71f'
		}
		else {
			// this.color = '#09f'
			if (this.x !== this.baseX) {
				let dx = this.x - this.baseX
				this.x -= dx / 10
			}
			if (this.y !== this.baseY) {
				let dy = this.y - this.baseY
				this.y -= dy / 10
			}
		}
	}
}

function init() {
	let img = new Image()
	img.src = 'Djalmir.png'
	img.addEventListener('load', () => {
		c.drawImage(img, 0, 0, canvas.width, canvas.height)
		imgCoordinates = c.getImageData(0, 0, canvas.width, canvas.height)
		particleArray = []
		for (let y = 0, y2 = imgCoordinates.height; y < y2; y += 4) {
			for (let x = 0, x2 = imgCoordinates.width; x < x2; x += 4) {
				if (imgCoordinates.data[(y * 4 * imgCoordinates.width) + (x * 4) + 3] > 128) {
					let positionX = x
					let positionY = y
					particleArray.push(new Particle(positionX, positionY, `rgba(${ imgCoordinates.data[(y * 4 * imgCoordinates.width) + (x * 4)] },${ imgCoordinates.data[(y * 4 * imgCoordinates.width) + (x * 4) + 1] },${ imgCoordinates.data[(y * 4 * imgCoordinates.width) + (x * 4) + 2] },${ imgCoordinates.data[(y * 4 * imgCoordinates.width) + (x * 4) + 3] })`))
				}
			}
		}
	})
}

init()

function animate() {
	c.clearRect(0, 0, canvas.width, canvas.height)
	let opacityValue = 1
	for (let a = 0; a < particleArray.length; a++) {
		particleArray[a].draw()
		particleArray[a].update()
	}
	requestAnimationFrame(animate)
}
animate()


const matrixCanvas = document.querySelector('#matrixCanvas')
const matrixC = matrixCanvas.getContext('2d')

matrixCanvas.width = 477
matrixCanvas.height = 523

let gradient = matrixC.createRadialGradient(matrixCanvas.width/2,matrixCanvas.height/2,90,matrixCanvas.width/2,matrixCanvas.height/2,250)
gradient.addColorStop(0, '#03f')
gradient.addColorStop(0.5, '#ff0')
gradient.addColorStop(1, '#0f0')

class Symbol {
	constructor(x, y, fontSize, canvasHeight) {
		this.characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン'
		this.x = x
		this.y = y
		this.fontSize = fontSize
		this.text = ''
		this.canvasHeight = canvasHeight
	}
	draw(context) {
		this.text = this.characters.charAt(Math.floor(Math.random() * this.characters.length))
		context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize)
		if (this.y * this.fontSize > this.canvasHeight && Math.random() > .9) {
			this.y = 0
		}
		else {
			this.y += 1
		}
	}
}

class Effect {
	constructor(canvasWidth, canvasHeight) {
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.fontSize = 25
		this.columns = this.canvasWidth / this.fontSize
		this.symbols = []
		this.#initialize()
	}

	#initialize() {
		for (let i = 0; i < this.columns; i++) {
			this.symbols[i] = new Symbol(i, this.canvasHeight, this.fontSize, this.canvasHeight)
		}
	}

	resize(width, height) {
		this.canvasWidth = width
		this.canvasHeight = height
		this.columns = this.canvasWidth / this.fontSize
		this.symbols = []
		this.#initialize()
	}
}

const effect = new Effect(matrixCanvas.width, matrixCanvas.height)

let lastTime = 0
const fps = 30
const nextFrame = 1000 / fps
let timer = 0

function matrixAnimate(timeStamp) {
	const deltaTime = timeStamp - lastTime
	lastTime = timeStamp
	if (timer > nextFrame) {
		matrixC.fillStyle = 'rgba(0,0,0,.1)'
		matrixC.textAlign = 'center'
		matrixC.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height)
		matrixC.fillStyle = gradient//'#0099ff'
		matrixC.font = effect.fontSize + 'px monospace'
		effect.symbols.forEach(symbol => symbol.draw(matrixC))
		timer = 0
	}
	else
		timer += deltaTime
	requestAnimationFrame(matrixAnimate)
}
matrixAnimate(0)

// window.addEventListener('resize', () => {
// 	matrixCanvas.width = window.innerWidth
// 	matrixCanvas.height = window.innerHeight
// 	effect.resize(matrixCanvas.width, matrixCanvas.height)
// })