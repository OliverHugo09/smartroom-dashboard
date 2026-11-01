# Mosquitto con credenciales embebidas (permisos de Linux correctos)
FROM eclipse-mosquitto:2

COPY pwfile /mosquitto/config/pwfile
RUN chmod 644 /mosquitto/config/pwfile

CMD ["mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]
