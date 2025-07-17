#include <WiFi.h>
#include <WebServer.h>
#include <SPIFFS.h>
#include <WebSocketsServer.h>

const char* ssid = "BioBot";
const char* password = "58602204Emicr718";

bool objetoAdelanteL = false;
bool objetoAdelanteR = false;

const int triggerDLPin = 12;
const int echoDLPin = 13;

const int triggerDRPin = 14;
const int echoDRPin = 15;

const int salidaMotor1A = 5;
const int salidaMotor1B = 4;
const int salidaMotor2A = 19;
const int salidaMotor2B = 21;


WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81); // WebSocket en puerto 81

// Obtener tipo MIME por extensión
String getContentType(String filename) {
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".png")) return "image/png";
  else if (filename.endsWith(".jpg")) return "image/jpeg";
  else if (filename.endsWith(".gif")) return "image/gif";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  else if (filename.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

// Servir archivos estáticos desde SPIFFS
void handleFileRead(String path) {
  if (path.endsWith("/")) path += "sidebar.html";

  String contentType = getContentType(path);

  if (SPIFFS.exists(path)) {
    File file = SPIFFS.open(path, "r");
    server.streamFile(file, contentType);
    file.close();
  } else {
    server.send(404, "text/plain", "Archivo no encontrado");
  }
}

void handleNotFound() {
  handleFileRead(server.uri());
}

// Manejo de eventos WebSocket
void activar(uint8_t receivedByte)
{

  if(objetoAdelanteL && objetoAdelanteR)
  {
    digitalWrite(salidaMotor1A, LOW);
    digitalWrite(salidaMotor1B, (receivedByte & 0b00000100) ? HIGH : LOW);
    digitalWrite(salidaMotor2A, (receivedByte & 0b00000010) ? HIGH : LOW);
    digitalWrite(salidaMotor2B, (receivedByte & 0b00000001) ? HIGH : LOW);
  }
  else if(objetoAdelanteL && !objetoAdelanteR)
  {
    digitalWrite(salidaMotor1A, (receivedByte & 0b00001000) ? HIGH : LOW);
    digitalWrite(salidaMotor1B, (receivedByte & 0b00000100) ? HIGH : LOW);
    digitalWrite(salidaMotor2A, LOW);
    digitalWrite(salidaMotor2B, HIGH);
  }
  else if(!objetoAdelanteL && objetoAdelanteR)
  {
    digitalWrite(salidaMotor1A, (receivedByte & 0b00001000) ? HIGH : LOW);
    digitalWrite(salidaMotor1B, (receivedByte & 0b00000100) ? HIGH : LOW);
    digitalWrite(salidaMotor2A, HIGH);
    digitalWrite(salidaMotor2B, LOW);
  }
  else
  {
    digitalWrite(salidaMotor1A, (receivedByte & 0b00001000) ? HIGH : LOW);
    digitalWrite(salidaMotor1B, (receivedByte & 0b00000100) ? HIGH : LOW);
    digitalWrite(salidaMotor2A, (receivedByte & 0b00000010) ? HIGH : LOW);
    digitalWrite(salidaMotor2B, (receivedByte & 0b00000001) ? HIGH : LOW);
  }
}

void deteccionObjeto()
{
  long durationDL, durationDR;
  float distanceDL, distanceDR;

  digitalWrite(triggerDLPin, LOW);
  delayMicroseconds(2);
  digitalWrite(triggerDLPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerDLPin, LOW);

  durationDL = pulseIn(echoDLPin, HIGH);

  distanceDL = durationDL * 0.0343 / 2;

  digitalWrite(triggerDRPin, LOW);
  delayMicroseconds(2);
  digitalWrite(triggerDRPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerDRPin, LOW);

  durationDR = pulseIn(echoDRPin, HIGH);

  distanceDR = durationDR * 0.0343 / 2;

  if((distanceDL <= 15 && distanceDR <= 15) | distanceDL <=5 | distanceDR <=5)
  {
    objetoAdelanteL = true;
    objetoAdelanteR = true;
  }
  else if(distanceDL <=15)
  {
    objetoAdelanteL = true;
    objetoAdelanteR = false;
  }
  else  if (distanceDR <= 15)
  {
    objetoAdelanteL = false;
    objetoAdelanteR = true;
  }
  else
  {
    objetoAdelanteL = false;
    objetoAdelanteR = false;
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length)
{
    switch (type)
    {
      case WStype_CONNECTED:
      Serial.printf("Cliente conectado: %u\n", num);
      break;

      case WStype_DISCONNECTED:
      Serial.printf("Cliente desconectado: %u\n", num);
      break;

      case WStype_TEXT:
        Serial.printf("Mensaje recibido: %s\n", payload);
        webSocket.sendTXT(num, "ESP32: Mensaje recibido!"); // Responder al cliente
      break;

      case WStype_BIN:
          activar(payload[0]);
          webSocket.sendBIN(num, payload, length); // Responder con los mismos datos
        break;
  }
}


void setup() {
  pinMode(triggerDLPin, OUTPUT);
  pinMode(echoDLPin, INPUT);

  pinMode(triggerDRPin, OUTPUT);
  pinMode(echoDRPin, INPUT);


  pinMode(salidaMotor1A, OUTPUT);
  pinMode(salidaMotor1B, OUTPUT);
  pinMode(salidaMotor2A, OUTPUT);
  pinMode(salidaMotor2B, OUTPUT);

  digitalWrite(salidaMotor1A, LOW);
  digitalWrite(salidaMotor1B, LOW);
  digitalWrite(salidaMotor2A, LOW);
  digitalWrite(salidaMotor2B, LOW);
  Serial.begin(115200);

  if (!SPIFFS.begin(true)) {
    Serial.println("Error al montar SPIFFS");
    return;
  }

  WiFi.softAP(ssid, password);
  Serial.print("AP iniciado. IP: ");
  Serial.println(WiFi.softAPIP());

  server.onNotFound(handleNotFound);
  server.begin();

  // Inicializar WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  Serial.println("Servidor HTTP y WebSocket iniciado");
}

void loop() {
  server.handleClient();
  webSocket.loop();
}
