FROM mongo:4.4

ADD db-setup.sh /tmp/db-setup.sh
ADD db-setup.js /tmp/db-setup.js

RUN chmod +x /tmp/db-setup.sh

CMD ["/tmp/db-setup.sh"]