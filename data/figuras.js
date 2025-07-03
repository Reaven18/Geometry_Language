const sidebar = document.querySelector(".sidebar")
const bloques = document.querySelector("#bloques");
const listaBloques = document.querySelector('#block-list');
console.log(listaBloques.style.display);
bloques.addEventListener('click', (e) =>
    {
        listaBloques.style.display = "flex";
    })

sidebar.addEventListener('mouseleave', (e) =>
    {
        listaBloques.style.display = "none";
    });




class GridSheet {
constructor(canvasId)
{
//Obtines el canvas y su contexto
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    // Obtiene el contenedor del canvas
    this.container = this.canvas.parentElement;

    // Configuración de la cuadrícula
    this.gridSize = 20; // píxeles por cuadro
    this.zoom = 1;

    // Figuras colocadas
    this.placedFigures = [];
    //Figura que esta siendo arrastrada
    this.draggedFigure = null;
    this.figureCounter = 0;

    // Drag and drop
    //Muestra la preview del objeto al ser arrastrado
    this.dragPreview = null;
    //establece si hay una figura arrastrandose o no
    this.isDraggingFromPanel = false;

    this.setupEventListeners();
    this.draw();
    this.updateInfo();
}

setupEventListeners() {
    // Eventos del canvas
    //Agrega eventos para el canvas
    // Mueve el mouse sobre el canvas
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    // Rueda del mouse para zoom
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

    // Eventos de drag and drop desde el panel
    this.setupFigurePanelEvents();

    // Eventos para figuras colocadas
    //Agrega al contenedor el metodo
    this.container.addEventListener('mousedown', (e) => this.handlePlacedFigureMouseDown(e));
    document.addEventListener('mousemove', (e) => this.handleDocumentMouseMove(e));
    document.addEventListener('mouseup', (e) => this.handleDocumentMouseUp(e));
}

setupFigurePanelEvents() {
    //Guarda los elementos de las figuras del panel
    const figureItems = document.querySelectorAll('.figure-item');

    figureItems.forEach(item => {
        item.addEventListener('mousedown', (e) => this.startDragFromPanel(e, item));
    });
}

startDragFromPanel(e, figureItem)
{
    e.preventDefault();
    this.isDraggingFromPanel = true;

    const shapeType = figureItem.dataset.shape;

    // Crear preview del drag
    this.dragPreview = this.createDragPreview(shapeType);
    document.body.appendChild(this.dragPreview);

    this.updateDragPreview(e);
}

createDragPreview(shapeType)
{
    const preview = document.createElement('div');
    preview.className = 'drag-preview';

    const shape = this.createShapeElement(shapeType, 50); // Tamaño más grande para preview
    preview.appendChild(shape);

    return preview;
}

createShapeElement(shapeType, size = 45) {
    const shape = document.createElement('div');
    shape.style.width = size + 'px';
    shape.style.height = size + 'px';

    switch(shapeType) {
        case 'rectangle':
            shape.style.background = '#5ce1e6';
            shape.style.width = (size * 1.2) + 'px';
            shape.style.height = (size * 0.8) + 'px';
            shape.style.borderRadius = '3px';
            break;
        case 'rhombus':
            shape.style.background = '#ffbd59';
            shape.style.width = (size * 1.5) + 'px';
            shape.style.height = (size * 0.9) + 'px';
            shape.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
            shape.style.borderRadius = '3px';
            break;
        case 'pentagon':
            shape.style.background = '#b4b4b4';
            shape.style.width = (size * 0.9) + 'px';
            shape.style.height = (size * 0.9) + 'px';
            shape.style.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
            break;
        case 'circle':
            shape.style.background = '#cb6ce6';
            shape.style.borderRadius = '50%';
            break;
        case 'cicle':
            shape.style.background = '#1800ad';
            shape.style.width = (size * 0.8) + 'px';
            shape.style.height = (size ) + 'px';
            shape.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 82%, 50% 100%, 0% 82%)';
            break;
        case 'inicio':
            shape.style.width = (size * 1.2 ) + 'px';
            shape.style.height = (size * 0.5) + 'px';
            shape.style.borderRadius = '20px';
            shape.style.background = "#38b6ff";
            break;
        case 'fin':
            shape.style.width = (size * 1.2) + 'px';
            shape.style.height = (size * 0.5) + 'px';
            shape.style.borderRadius = '20px';
            shape.style.background = "#ff5757";
            break;
        case 'pause':
            shape.style.width = (size * 0.9) + 'px';
            shape.style.height = (size * 0.9) + 'px';
            shape.style.borderTopRightRadius = '50px';
            shape.style.borderBottomRightRadius = '50px';
            shape.style.background = "#ff6d4d";
            break;
        case 'romboid':
            shape.style.background = '#7ed957';
            shape.style.width = (size * 1.4) + 'px';
            shape.style.height = (size * 0.5) + 'px';
            shape.style.clipPath = 'polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%)';
            break;
    }

    return shape;
}

updateDragPreview(e)
{
    //Si dragPreview no esta vacio entonces
    if (this.dragPreview)
    {
        //Actualiza la pocision con respecto al mouse de la figura prevista, es decir, es para que la figura al ser
        //seleccionada tenga el efecto de que sigue al ratón
        this.dragPreview.style.left = (e.clientX - 25) + 'px';
        this.dragPreview.style.top = (e.clientY - 25) + 'px';
    }
}

handleDocumentMouseMove(e) {
    //Si hay una figura que esta siendo arrastrada entonces
    if (this.isDraggingFromPanel)
    {
        //actualiza las coordenadas de la prevista de la figura seleeccionada
        this.updateDragPreview(e);
    }
    //Si no hay una figura que esta siendo arrastrada entonces va a revisar que no tenga nada el objeto draggedFigure si contiene algo
    //quiere decir que la figura esta siendo arrastrada pero en el plano cartesiano
    else if (this.draggedFigure)
    {
        //Hace que la figura se mueva en el plano cartesiano
        this.movePlacedFigure(e);
    }
}

handleDocumentMouseUp(e)
{
    //Si hay una figura que esta siendo arrastrada del panel al plano cartesiano entonces
    if (this.isDraggingFromPanel)
    {
        //Crea la figura
        this.handleDropFromPanel(e);
    }
    //Si la figura esta siendo arrastrada dentro del lienzo
    else if (this.draggedFigure)
    {
        this.stopDragPlacedFigure();
    }
}

handleDropFromPanel(e)
{
    //Captura la posicion con respecto a la pantalla del lienzo
    const canvasRect = this.canvas.getBoundingClientRect();

    //Verifica si el raton esta dentro del lienzo, si es así guarda true.
    const isOverCanvas = e.clientX >= canvasRect.left &&
                        e.clientX <= canvasRect.right &&
                        e.clientY >= canvasRect.top &&
                        e.clientY <= canvasRect.bottom;

    //Si el raton esta sobre el lienzo entonces
    if (isOverCanvas)
    {
        //Captura las coordenadas con respecto a lo que esta dentro del lienzo
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;

        // Ajustar a la cuadrícula a las coordenadas del plano cartesiano
        const gridX = Math.round(x / (this.gridSize * this.zoom)) * (this.gridSize * this.zoom);
        const gridY = Math.round(y / (this.gridSize * this.zoom)) * (this.gridSize * this.zoom);

        //Crea la figura al soltar el clic, manda el tipo de figura y las coordenadas x y y
        this.placeFigure(this.getShapeTypeFromPreview(), gridX, gridY);
    }

    this.cleanupDragFromPanel();
}

getShapeTypeFromPreview() {
    // Obtener el tipo de figura del preview actual
    const figureItems = document.querySelectorAll('.figure-item');
    return figureItems[0].dataset.shape; // Por simplicidad, usar el primer tipo
    // En una implementación más completa, rastrearías qué figura se está arrastrando
}

cleanupDragFromPanel()
{
    if (this.dragPreview)
    {
        this.dragPreview.remove();
        this.dragPreview = null;
    }
    this.isDraggingFromPanel = false;
}

placeFigure(shapeType, x, y) {
    //Crea un elemento div
    const figure = document.createElement('div');
    //agrega propiedades como clase y estilo
    figure.className = 'placed-figure';
    figure.style.left = x + 'px';
    figure.style.top = y + 'px';

    const shape = this.createShapeElement(shapeType);
    shape.style.transform = `scale(${this.zoom})`;
    figure.appendChild(shape);

    this.container.appendChild(figure);

    const figureData = {
        id: this.figureCounter++,
        element: figure,
        figure: figure.firstChild,
        shapeType: shapeType,
        x: x,
        y: y,
        width: figure.firstChild.clientWidth,
        height: figure.firstChild.clientHeight
    };

    //Agregas la figura a la lista
    this.placedFigures.push(figureData);
    this.updateInfo();
}

handlePlacedFigureMouseDown(e) {
    //.target la funcion que tiene es devolverte el elemento donde se hizo click
    // si es un boton devuelve <button id="bt"></button>
    //closest devuelve el primer ancestro que encuentre con la caracteristica dada
    //Es decir que va a buscar al primer padre que tenga la clase .placed-figure
    if (e.target.closest('.placed-figure'))
    {
        //si detecta que el objeto presionado es una figura entonces
        //quitas los eventos programados por defecto para poder agregar tu propia logica
        e.preventDefault();

        //Agrega la figura que se detecto que se esta cliqueando a la figura actual que esta siendo arrastrada
        this.draggedFigure = e.target.closest('.placed-figure');
        //agrega la clase dragging a la figura pra que se activen sus metodos css
        this.draggedFigure.classList.add('dragging');

        //guarda la posicion de la figura que tiene dentro del plano cartesiano
        const rect = this.draggedFigure.getBoundingClientRect();
        //Obtiene las coordenadas del plano cartesiano
        const containerRect = this.container.getBoundingClientRect();

        //Crea un arreglo con la posicion de la figura cliqueada con respecto al plano cartesiano
        this.dragOffset = {
            //e.clientX devuelve la posicion horizontal relativa con respecto a toda la pantalla del mouse
            //e.clientY devuelve la posicion vertical relativa con respecto a toda la pantalla del mouse

            // e.clientX: posición horizontal del mouse relativa al viewport (ventana visible del navegador)
            // rect.left: posición horizontal de la figura respecto al viewport
            // rect.width / 2: mitad del ancho de la figura, para centrar el punto de arrastre en el centro del elemento

            //A la posición del mouse le resta el valor left de rect que es la posicion de la figura en el plano cartesiano
            //luego le resta el tamaño del ancho de rect dividido entre 2
            x: e.clientX - rect.left - rect.width / 2,

            // e.clientY: posición vertical del mouse relativa al viewport
            // rect.top: posición vertical de la figura respecto al viewport
            // rect.height / 2: mitad del alto de la figura, para centrar el punto de arrastre en el centro del elemento

            //A la posición del mouse le resta el valor top de rect que es la posicion de la figura en el plano cartesiano
            //luego le resta el tamaño del alto de rect dividido entre 2
            y: e.clientY - rect.top - rect.height / 2
        };
    }
}

movePlacedFigure(e)
{
    //Si hay una fiigura que esta siendo arrastrada entonces
    if (this.draggedFigure)
    {
        //Obtiene las coordenadas del contenedor del plano cartesiano relativas de la pantalla
        const containerRect = this.container.getBoundingClientRect();

        // e.clientX: posición horizontal del mouse relativa al viewport (ventana visible del navegador)
        // containerRect.left: posición del borde izquierdo del contenedor con respecto a la pantalla
        // dragOffset.x: coordenada de la figura con respecto al plano cartesiano

        // Guarda la coodenada de la figura con respecto a el movimiento del raton
        let x = e.clientX - containerRect.left - this.dragOffset.x;

        // Lo mismo que con x pero con las coordenadas horizontales
        let y = e.clientY - containerRect.top - this.dragOffset.y;

        // Ajustar a la cuadrícula
        //Ajusta la posición con respecto a la cuadricula, es decir, al tamaño de los cuadros y el zoom
        x = Math.round(x / (this.gridSize * this.zoom)) * (this.gridSize * this.zoom);
        y = Math.round(y / (this.gridSize * this.zoom)) * (this.gridSize * this.zoom);

        //Mueven la figura a la posición de x y y
        this.draggedFigure.style.left = x + 'px';
        this.draggedFigure.style.top = y + 'px';

        // Actualizar datos
        const figureData = this.placedFigures.find(f => f.element === this.draggedFigure);
        if (figureData) {
            figureData.x = x;
            figureData.y = y;
        }
    }
}

stopDragPlacedFigure()
{
    if (this.draggedFigure)
        {
        //Quita la clase dragging
        this.draggedFigure.classList.remove('dragging');
        //Remueve la figura de figura arrastrada porque este ya no es así
        this.draggedFigure = null;
    }
}

getCanvasCoordinates(e)
{
    //Guarda las coordenadas relativas con respecto a toda la pantalla del lienzo
    const rect = this.canvas.getBoundingClientRect();

    return {
        // Calcula la posición del cursor dentro del canvas, restando la posición del borde izquierdo (x)
        // y del borde superior (y) del canvas respecto al viewport
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvasToGrid(canvasX, canvasY) {
    //gridSize es el tamaño de cada cuadro del plano cartesiano
    //zoom es la escala a la que se encuentra
    //canvasX es la posicion del puntero en la pantalla
    //gridX y gridY son las coordenadas de el cuadro en el que esta ubicado el mouse
    const gridX = Math.floor(canvasX / (this.gridSize * this.zoom));
    const gridY = Math.floor(canvasY / (this.gridSize * this.zoom));
    return { x: gridX, y: gridY };
}

draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Fondo blanco
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
}

drawGrid() {
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 1;



    const step = this.gridSize * this.zoom/4;

    // Líneas verticales
    for (let x = 0.5; x <= this.canvas.width; x += step) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }

    // Líneas horizontales
    for (let y = 0.5; y <= this.canvas.height; y += step) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }
}

handleMouseMove(e) {
    //calcula las coordenadas dentro del canvas
    const coords = this.getCanvasCoordinates(e);
    //calcula el cuadro en el que estas dentro del plano cartesiano
    const grid = this.canvasToGrid(coords.x, coords.y);
    //Esto permite saber en que coordenada estas dentro del lienzo
    this.updateMouseInfo(grid.x, grid.y);
}

handleWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(0.5, Math.min(10, this.zoom * zoomFactor));
    this.draw();
    this.updateFigurePositions();
    this.updateInfo();
}

updateFigurePositions() {
    // Reposicionar figuras según el nuevo zoom
    this.placedFigures.forEach(figure => {
        const newX = figure.x * this.zoom;
        const newY = figure.y * this.zoom;
        figure.element.style.left = newX + 'px';
        figure.element.style.top = newY + 'px';
        figure.figure.style.transform = `scale(${this.zoom})`;

    });
}

clearFigures() {
    this.placedFigures.forEach(figure => {
        figure.element.remove();
    });
    this.placedFigures = [];
    this.figureCounter = 0;
    this.updateInfo();
}

updateMouseInfo(gridX, gridY) {
    const info = document.getElementById('info');
    info.innerHTML = `
        Cuadrícula: (${gridX}, ${gridY})<br>
        Figuras: ${this.placedFigures.length}<br>
        Zoom: ${Math.round(this.zoom * 100)}%
    `;
}

updateInfo() {
    const info = document.getElementById('info');
    info.innerHTML = `
        Cuadrícula: (0, 0)<br>
        Figuras: ${this.placedFigures.length}<br>
        Zoom: ${Math.round(this.zoom * 100)}%
    `;
}

zoomIn() {
    this.draw();
    this.updateFigurePositions();
    this.updateInfo();
}

zoomOut() {

    this.draw();
    this.updateFigurePositions();
    this.updateInfo();
}

resetZoom() {
    this.zoom = 1;
    this.draw();
    this.updateFigurePositions();
    this.updateInfo();
}
}

// Actualizar para reconocer el tipo de figura que se está arrastrando
let currentDragShape = null;

// Mejorar el sistema de drag desde el panel
document.addEventListener('DOMContentLoaded', () => {
const figureItems = document.querySelectorAll('.figure-item');

figureItems.forEach(item => {
    item.addEventListener('mousedown', (e) => {
        currentDragShape = item.dataset.shape;
    });
});
});

// Modificar la función para obtener el tipo de figura
GridSheet.prototype.getShapeTypeFromPreview = function()
{
    return currentDragShape || 'rectangle';
};

// Inicializar la hoja cuadriculada
let gridSheet;

window.addEventListener('load', () =>
    {
        gridSheet = new GridSheet('canvas');
    });

// Funciones globales para los botones
function zoomIn()
{
    gridSheet.zoomIn();
}

function zoomOut()
{
    gridSheet.zoomOut();
}

function resetZoom()
{
    gridSheet.resetZoom();
}

function clearFigures()
{
    gridSheet.clearFigures();
}