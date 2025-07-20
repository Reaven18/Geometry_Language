const btnUp = document.getElementById('btnUp');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnDown = document.getElementById('btnDown');
    let btnUpClicked = false;
    let btnLeftClicked = false;
    let btnRightClicked = false;
    let btnDownClicked = false;

    let esp32IP = "192.168.4.1";  // Cambia esto por la IP del ESP32
    let socket = new WebSocket("ws://" + esp32IP + ":81/");

    socket.onopen = function() {
        document.getElementById("estado").innerText = "Estado: Conectado";
    };

    socket.onmessage = function(event) {
        document.getElementById("respuesta").innerText = "ESP32 dice: " + event.data;
    };

    socket.onclose = function() {
        document.getElementById("estado").innerText = "Estado: Desconectado";
    };

    document.addEventListener("keydown", function (event)
        {

            if (event.key === "ArrowUp" && !btnUpClicked)
            {
                btnUp.dispatchEvent(new MouseEvent("mousedown"));
            }
        });

        document.addEventListener("keyup", function (event)
        {
            if (event.key === "ArrowUp")
            {
                btnUp.dispatchEvent(new MouseEvent("mouseup"));
            }
        });


        document.addEventListener("keyup", function (event)
        {
            if (event.key === "ArrowDown")
            {
                btnDown.dispatchEvent(new MouseEvent("mouseup"));
            }
        });

        document.addEventListener("keydown", function (event)
        {
            if (event.key === "ArrowDown" && !btnDownClicked)
            {
                btnDown.dispatchEvent(new MouseEvent("mousedown"));
            }
        });
        document.addEventListener("keyup", function (event)
        {
            if (event.key === "ArrowLeft")
            {
                btnLeft.dispatchEvent(new MouseEvent("mouseup"));
            }
        });

        document.addEventListener("keydown", function (event)
        {
            if (event.key === "ArrowLeft" && !btnLeftClicked)
            {
                btnLeft.dispatchEvent(new MouseEvent("mousedown"));
            }
    });

        document.addEventListener("keyup", function (event)
        {
            if (event.key === "ArrowRight")
            {
                btnRight.dispatchEvent(new MouseEvent("mouseup"));
            }
        });


        document.addEventListener("keydown", function (event)
        {
            if (event.key === "ArrowRight" && !btnRightClicked)
            {
                btnRight.dispatchEvent(new MouseEvent("mousedown"));
            }
        });


    function enviarMensaje() {
        let mensaje = document.getElementById("mensaje").value;
        socket.send(mensaje);
    }

    btnUp.addEventListener('mousedown', () =>{
        btnUpClicked = true;
        checkButtons();
    });
    btnLeft.addEventListener('mousedown', () =>{
        btnLeftClicked = true;
        checkButtons();
    });
    btnRight.addEventListener('mousedown', () =>{
        btnRightClicked = true;
        checkButtons();
    });
    btnDown.addEventListener('mousedown', () =>{
        btnDownClicked = true;
        checkButtons();
    });
    btnUp.addEventListener('mouseup', () =>{
        btnUpClicked = false;
        checkButtons();
    });
    btnLeft.addEventListener('mouseup', () =>{
        btnLeftClicked = false;
        checkButtons();
    });
    btnRight.addEventListener('mouseup', () =>{
        btnRightClicked = false;
        checkButtons();
    });
    btnDown.addEventListener('mouseup', () =>{
        btnDownClicked = false;
        checkButtons();
    });

    function checkButtons()
    {
        let activador = "";
        let byte = new Uint8Array(1);
        if(btnUpClicked && !btnDownClicked && (!btnLeftClicked || !btnRightClicked))
        {
            //Manda el reultado de la tabla de verdad de la entrada del pin salidaMotor1A
            activador += "1";
        }
        else
        {
            activador += "0";
        }
        if(!btnUpClicked && btnDownClicked && (!btnLeftClicked || !btnRightClicked))
        {
            //Manda el reultado de la tabla de verdad de la entrada del pin salidaMotor1B
            activador += "1";
        }
        else
        {
            activador += "0";
        }
        if(btnLeftClicked && !btnRightClicked && (!btnUpClicked || !btnDownClicked))
        {
            //Manda el reultado de la tabla de verdad de la entrada del pin salidaMotor2A
            activador += "1";
        }
        else
        {
            activador += "0";
        }
        if(!btnLeftClicked && btnRightClicked && (!btnUpClicked || !btnDownClicked))
        {
            //Manda el reultado de la tabla de verdad de la entrada del pin salidaMotor2B
            activador += "1";
        }
        else
        {
            activador += "0";
        }
        byte[0] = parseInt(activador, 2);

        socket.send(byte);
    }