# Mosquitto (broker local, F0)

Arrancar:
  docker compose up mosquitto

Probar publicación/suscripción (desde el contenedor):
  docker exec -it smartroom-mosquitto mosquitto_pub -h localhost -u smartroom -P smartroom -t smartroom/test -m hola
  docker exec -it smartroom-mosquitto mosquitto_sub -h localhost -u smartroom -P smartroom -t smartroom/#

Generar credenciales (pwfile):
  docker run --rm -v ${PWD}/services/mosquitto:/mosquitto/config \
    eclipse-mosquitto:2 mosquitto_passwd -c /mosquitto/config/pwfile smartroom

Criterio de aceptación F0: publicación autenticada llega; anónima es rechazada.
