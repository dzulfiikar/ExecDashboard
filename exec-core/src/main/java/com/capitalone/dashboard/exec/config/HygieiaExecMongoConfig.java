package com.capitalone.dashboard.exec.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@EnableMongoRepositories("com.capitalone.dashboard.exec.repository")
public class HygieiaExecMongoConfig extends AbstractMongoClientConfiguration {
    private static final Logger LOGGER = LoggerFactory.getLogger(com.capitalone.dashboard.exec.config.HygieiaExecMongoConfig.class);

    @Value("${dbname:dashboard}")
    private String databaseName;
    @Value("${dbhost:localhost}")
    private String host;
    @Value("${dbport:27017}")
    private int port;
    @Value("${dbreplicaset:false}")
    private String dbreplicaset;
    @Value("#{'${dbhostport:localhost:27017}'.split(',')}")
    private List<String> hostport;
    @Value("${dbusername:}")
    private String userName;
    @Value("${dbpassword:}")
    private String password;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        MongoClientSettings.Builder settings = MongoClientSettings.builder()
                .applyToConnectionPoolSettings(builder -> builder.maxConnectionIdleTime(60000, java.util.concurrent.TimeUnit.MILLISECONDS));

        if (Boolean.parseBoolean(dbreplicaset)) {
            List<ServerAddress> serverAddressList = hostport.stream().map(this::toServerAddress).collect(Collectors.toList());
            serverAddressList.forEach(s -> LOGGER.info("Initializing Mongo Client server ReplicaSet at: {}", s));
            settings.applyToClusterSettings(builder -> builder.hosts(serverAddressList));
        } else {
            ServerAddress serverAddr = new ServerAddress(host, port);
            LOGGER.info("Initializing Mongo Client server at: {}", serverAddr);
            settings.applyConnectionString(new ConnectionString("mongodb://" + host + ":" + port));
        }

        if (StringUtils.hasText(userName)) {
            settings.credential(MongoCredential.createScramSha1Credential(userName, databaseName, password.toCharArray()));
        }

        MongoClient client = MongoClients.create(settings.build());
        LOGGER.info("Connecting to Mongo: {}", client);
        return client;
    }

    private ServerAddress toServerAddress(String hostPort) {
        String myHost = hostPort.substring(0, hostPort.indexOf(":"));
        int myPort = Integer.parseInt(hostPort.substring(hostPort.indexOf(":") + 1));
        return new ServerAddress(myHost, myPort);
    }

    protected String getMappingBasePackage() {
        return com.capitalone.dashboard.exec.model.Portfolio.class.getPackage().getName();
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}
