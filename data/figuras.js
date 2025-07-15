const sidebar = document.querySelector(".sidebar")
const bloques = document.querySelector("#bloques");
const listaBloques = document.querySelector('#block-list');
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
    this.ajustarCanvas();
    this.ctx = this.canvas.getContext('2d');
    // Obtiene el contenedor del canvas
    this.container = this.canvas.parentElement;

    // Configuración de la cuadrícula
    this.gridSize = 20; // píxeles por cuadro
    this.zoom = 1;

    // Figuras colocadas
    this.placedFigures = [];
    //Figura que esta siendo arrastrada
    this.flechaSeleccionada = [];
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
    this.container.addEventListener('mousedown', (e) => {this.handlePlacedFigureMouseDown(e)});
    this.container.addEventListener('click', (e) => this.clickCanvas(e));
    document.addEventListener('mousemove', (e) => this.handleDocumentMouseMove(e));
    document.addEventListener('mouseup', (e) => this.handleDocumentMouseUp(e));
}

 ajustarCanvas() {
    const rect = canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
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

createShapeElement(shapeType, size = 100) {
    const shape = document.createElement('div');

    switch(shapeType) {
        case 'rectangle':
            shape.classList.add('shape-rectangle');
            shape.style.width = (size * 1.2 ) + 'px';
            shape.style.height = (size * 0.8) + 'px';
            break;
        case 'rhombus':
            shape.classList.add('shape-rhombus');
            shape.style.width = (size * 1.6) + 'px';
            shape.style.height = (size * 0.8) + 'px';
            break;
        case 'pentagon':
            shape.classList.add('shape-pentagon');
            shape.style.width = (size * 0.9) + 'px';
            shape.style.height = (size * 0.9) + 'px';
            break;
        case 'circle':
            shape.classList.add('shape-circle');
            shape.style.width = (size * 1.2) + 'px';
            shape.style.height = (size * 1.2) + 'px';
            break;
        case 'cicle':
            shape.classList.add('shape-cicle');
            shape.style.width = (size * 0.8) + 'px';
            shape.style.height = (size) + 'px';
            break;
        case 'inicio':
            shape.classList.add('shape-inicio');
            shape.style.width = (size * 1.6 ) + 'px';
            shape.style.height = (size * 0.6) + 'px';
            break;
        case 'fin':
            shape.classList.add('shape-fin');
            shape.style.width = (size * 1.6) + 'px';
            shape.style.height = (size * 0.6) + 'px';
            break;
        case 'pause':
            shape.classList.add('shape-pause');
            shape.style.width = (size * 0.9) + 'px';
            shape.style.height = (size * 0.9) + 'px';
            break;
        case 'romboid':
            shape.classList.add('shape-romboid');
            shape.style.width = (size * 1.6) + 'px';
            shape.style.height = (size * 0.8) + 'px';
            break;
        case 'flecha':
            shape.classList.add('flecha');
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

        //Guarda las coordenadas de la figura en el plano cartesiano
        const gridX = Math.round(x / (this.gridSize * this.zoom));
        const gridY = Math.round(y / (this.gridSize * this.zoom));
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

placeFigure(shapeType, x, y, apuntadorA = null)
{
    //Crea un elemento div
    let nodos = [];
    const figure = document.createElement('div');
    //agrega propiedades como clase y estilo
    figure.className = 'placed-figure';
    figure.style.left = (x*(this.zoom*this.gridSize)) + 'px';
    figure.style.top = (y*(this.zoom*this.gridSize)) + 'px';
    const shape = this.createShapeElement(shapeType);
    figure.addEventListener('click',() => this.clickFigure(figure));
    figure.appendChild(shape);
    this.container.appendChild(figure);

    const width = figure.clientWidth;
    const height = figure.clientHeight;
    shape.style.width = (width*this.zoom)+'px';
    shape.style.height = (height*this.zoom)+'px';

    const figureData =
    {
        id: this.figureCounter++,
        element: figure,
        shape: shape,
        nodos,
        shapeType: shapeType,
        x: x,
        y: y,
        x2: null,
        y2: null,
        flechas: [],
        apuntadorE: null,
        apuntadorA,
        width,
        height
    };
     if(shapeType !== 'flecha')
    {
        this.crearNodos(figureData);
    }


    //Agregas la figura a la lista
    this.placedFigures.push(figureData);
    this.updateInfo;
    return figureData;
}


crearNodos(figureData)
{
    let nodos = [];
    for(let i = 0; i<4; i++)
        {
            const nodo = document.createElement('div');
            nodo.className = 'nodo';
            figureData.element.appendChild(nodo);
            this.posicionarNodo(nodo,i,(figureData.width*this.zoom), (figureData.height*this.zoom));
            nodo.addEventListener('mousedown', (e) => this.clickNodo(figureData,i));
            nodos.push(nodo);
        }
    figureData.nodos = nodos;
}

crearFlecha(figureData, i)
{
    const rect = figureData.nodos[i].getBoundingClientRect();
    const coordenadas = this.calcularCoordenadas(figureData.nodos[i]);
    const flecha = this.placeFigure('flecha', coordenadas.x, coordenadas.y, figureData.nodos[i]);
    const evento = (e) => this.rotarFlecha( flecha, rect, e);
    figureData.flechas.push(flecha);
    flecha.element.style.border = 'none';
    this.flechaSeleccionada.push(flecha);
    this.flechaSeleccionada.push(evento);
    this.container.addEventListener('mousemove', evento);

}

actualizarFlecha(flecha, nodo)
{
    const X1 = nodo.offsetLeft + nodo.clientWidth / 2;
    const Y1 = nodo.offsetTop + nodo.clientHeight / 2;

    flecha.style.left = X1 + 'px';
    flecha.style.top = Y1 + 'px';
}

actualizarTamañoFlecha(arrow, rectNodo1, e = null, rectNodo2 = null)
{
    const X1 = Math.round(rectNodo1.left + rectNodo1.width / 2);
    const Y1 = Math.round(rectNodo1.top + rectNodo1.height / 2);
    const X2 = e ? Math.round(e.clientX) : rectNodo2 ? Math.round(rectNodo2.left + rectNodo2.width / 2) : 0;
    const Y2 = e ? Math.round(e.clientY) : rectNodo2 ? Math.round(rectNodo2.top + rectNodo2.height / 2) : 0;

    // Calcula la distancia entre los dos puntos
    const distance = Math.sqrt(Math.pow(X2 - X1, 2) + Math.pow(Y2 - Y1, 2))-5;
    arrow.shape.style.width = distance + 'px';

    arrow.width = distance;
}

rotarFlecha( arrow, rectNodo1, e = null, rectNodo2 = null, origen = "left" )
{
    const flecha = arrow.shape;
    flecha.style.transformOrigin = origen;
    const X1 = Math.round(rectNodo1.x + rectNodo1.width / 2);
    const Y1 = Math.round(rectNodo1.y + rectNodo1.height / 2);
    const coordenadas = this.calcularCoordenadas(arrow.apuntadorA);
    
    arrow.element.style.left = (coordenadas.x*(this.zoom*this.gridSize)) + 'px';
    arrow.element.style.top = (coordenadas.y*(this.zoom*this.gridSize)) + 'px';;
    let X2 = 0;
    let Y2 = 0;
    if(e)
    {
        this.actualizarTamañoFlecha(arrow, rectNodo1, e,);
        X2 = Math.round(e.clientX);
        Y2 = Math.round(e.clientY);
    }
    else if (rectNodo2)
    {
        this.actualizarTamañoFlecha(arrow, rectNodo1, null, rectNodo2);
        X2 = Math.round(rectNodo2.x + rectNodo2.width / 2);
        Y2 = Math.round(rectNodo2.y + rectNodo2.height / 2);
    }


    // Calcula el vector entre los dos puntos
    const vectorA = this.vector(X1, Y1, X2, Y2);
    const vectorB = this.vector(X1, Y1, X1 + 1, Y1); // Vector horizontal

    // Calcula el ángulo entre los dos vectores
    const angle = Math.round(this.angulo(vectorA, vectorB));

    // Aplica la rotación a la flecha
    if((vectorA.x >= 0 && vectorA.y >= 0)||(vectorA.x <= 0 && vectorA.y >= 0))
        {
            flecha.style.transform = `rotate(${angle}deg)`;
        }
    else
         {
            flecha.style.transform = `rotate(${-angle}deg)`;
         }
}

posicionarNodo(nodo, i, figureWidth, figureHeight)
{
      const nodoWidth = nodo.clientWidth/2;
            const nodoHeight = nodo.clientHeight/2;
            switch (i)
            {
                case 0:
                    nodo.style.left = figureWidth - nodoWidth + 'px';
                    nodo.style.top = figureHeight/2-nodoHeight + 'px';
                    break;
                case 1:
                    nodo.style.left = figureWidth/2-nodoWidth   + 'px';
                    nodo.style.top = figureHeight-nodoHeight + 'px';
                    break;
                case 2:
                    nodo.style.left = `-${nodoWidth}px`;;
                    nodo.style.top = figureHeight/2-nodoHeight + 'px';
                    break;
                case 3:
                    nodo.style.left = figureWidth/2-nodoWidth + 'px';
                    nodo.style.top =  `-${nodoHeight}px`;
                    break;
            }
}


ocultarTodosNodos()
{
    this.placedFigures.forEach(figure =>
        {
            figure.element.classList.remove('placed-figure-selected');
            figure.nodos.forEach(nodo => nodo.style.visibility = "hidden")
        });
}

clickCanvas(e)
{
    if(!e.target.closest('.placed-figure'))
    {
        this.ocultarTodosNodos();
    }

}
clickFigure(figure)
{
    this.ocultarTodosNodos();
     figure.classList.add('placed-figure-selected');
     this.placedFigures.forEach(dataElement =>
        {
            if (dataElement.element === figure)
                {
                    dataElement.nodos.forEach(nodo => nodo.style.visibility = "visible")
                }
        });
}

clickNodo(figureData, i)
{
    if(this.flechaSeleccionada.length > 0)
    {
        const coodenadas = this.calcularCoordenadas(figureData.nodos[i]);
        this.flechaSeleccionada[0].X2 = coodenadas.x;
        this.flechaSeleccionada[0].Y2 = coodenadas.y;
        this.flechaSeleccionada[0].apuntadorE = figureData.nodos[i];
        figureData.flechas.push(this.flechaSeleccionada[0]);
        this.container.removeEventListener('mousemove', this.flechaSeleccionada[1]);
        this.flechaSeleccionada.length = 0;
    }
    else
    {
        this.crearFlecha(figureData, i);
    }
}

handlePlacedFigureMouseDown(e) {
    //.target la funcion que tiene es devolverte el elemento donde se hizo click
    // si es un boton devuelve <button id="bt"></button>
    //closest devuelve el primer ancestro que encuentre con la caracteristica dada
    //Es decir que va a buscar al primer padre que tenga la clase .placed-figure
    const target = e.target.closest('.placed-figure');

    if (target)
    {
        //si detecta que el objeto presionado es una figura entonces
        //quitas los eventos programados por defecto para poder agregar tu propia logica
        e.preventDefault();
        this.placedFigures.forEach(figureData =>
            {
                if(figureData.element === target)
                {
                    this.draggedFigure = figureData;
                    this.draggedFigure.element.classList.add('dragging');
                    const figureRect = figureData.element.getBoundingClientRect();
                    this.dragOffset = {
                        x: e.clientX - figureRect.left,
                        y: e.clientY - figureRect.top
                    };
                }
            });

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
        y = Math.round(y / (this.gridSize * this.zoom));
        x = Math.round(x / (this.gridSize * this.zoom));

        // Asegura que las coordenadas no sean negativas
        x = Math.max(0, x);
        y = Math.max(0, y);

        //Mueven la figura a la posición de x y y
        this.draggedFigure.element.style.left = (x * (this.gridSize * this.zoom)) + 'px';
        this.draggedFigure.element.style.top = (y * (this.gridSize * this.zoom)) + 'px';

        this.draggedFigure.flechas.forEach(flecha =>
            {
                this.rotarFlecha(flecha, flecha.apuntadorA.getBoundingClientRect(), null, flecha.apuntadorE.getBoundingClientRect());
            });

        // Actualizar datos
        const figureData = this.placedFigures.find(f => f === this.draggedFigure);
        if (figureData)
            {
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
        this.draggedFigure.element.classList.remove('dragging');
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

canvasToGrid(canvasX, canvasY)
{
    //gridSize es el tamaño de cada cuadro del plano cartesiano
    //zoom es la escala a la que se encuentra
    //canvasX es la posicion del puntero en la pantalla
    //gridX y gridY son las coordenadas de el cuadro en el que esta ubicado el mouse
    const gridX = Math.floor(canvasX / (this.gridSize * this.zoom));
    const gridY = Math.floor(canvasY / (this.gridSize * this.zoom));
    return { x: gridX, y: gridY };
}

draw()
{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Fondo blanco
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
}

drawGrid() {
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 1;

    const step = this.gridSize * this.zoom;



    // Líneas verticales
    for (let x = 0; x <= this.canvas.width; x += step) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
    }

    // Líneas horizontales
    for (let y = 0; y <= this.canvas.height; y += step) {
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
        const newX = figure.x * (this.zoom*this.gridSize);
        const newY = figure.y * (this.zoom*this.gridSize);
        figure.element.style.left = newX + 'px';
        figure.element.style.top = newY + 'px';
        figure.shape.style.width = (figure.width * this.zoom)+'px';
        figure.shape.style.height = (figure.height * this.zoom)+'px';

        const nodos = figure.element.querySelectorAll('.nodo');
        nodos.forEach((nodo, index) => {
            this.posicionarNodo(nodo, index, figure.width * this.zoom, figure.height * this.zoom);
        });
    });
}

calcularCoordenadas(obj1)
{
    const rect = obj1.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    const x = rect.x - canvasRect.left;
    const y = rect.y - canvasRect.top ;

    //Guarda las coordenadas de la figura en el plano cartesiano
    const gridX = Math.round(x / (this.gridSize * this.zoom));
    const gridY = Math.round(y / (this.gridSize * this.zoom));
    return { x: gridX, y: gridY };
}

vector(X1, Y1, X2, Y2)
{
    return {
        x: X2 - X1,
        y: Y2 - Y1
    };
}



angulo(vectorA, vectorB)
{
    const dotProduct = this.productoPunto(vectorA, vectorB);
    const magnitudeA = this.Magnitud(vectorA);
    const magnitudeB = this.Magnitud(vectorB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Evitar división por cero
    }

    const cosTheta = dotProduct / (magnitudeA * magnitudeB);
    return Math.acos(cosTheta) * (180 / Math.PI); // Convertir a grados
}

Magnitud(vector)
{
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

productoPunto(vectorA, vectorB)
{
    return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
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
        window.addEventListener('resize', () => {gridSheet.ajustarCanvas();gridSheet.draw()});

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