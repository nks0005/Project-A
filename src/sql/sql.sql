CREATE DATABASE test_schema;
USE test_schema;

CREATE TABLE battles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    battle_id INT,
    totalFame INT,
    totalKills INT,
    countPlayers INT,
    victory_team VARCHAR(512),
    defeat_team VARCHAR(512),
    type INT,
    battle_time TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_battle_id ON battles (battle_id);


