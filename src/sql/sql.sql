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




ALTER TABLE battles
ADD COLUMN process TINYINT DEFAULT 0;



CREATE TABLE Simple_Weapon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_hand VARCHAR(255) UNIQUE KEY,
    used_count INT DEFAULT 0
);

CREATE TABLE Duo_Weapon_Comps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simple_weapon_A INT UNIQUE KEY,
    simple_weapon_B INT UNIQUE KEY,
    win_count INT DEFAULT 0,
    lose_count INT DEFAULT 0,
    FOREIGN KEY (simple_weapon_A) REFERENCES Simple_Weapon(id),
    FOREIGN KEY (simple_weapon_B) REFERENCES Simple_Weapon(id)
);


CREATE VIEW test_view AS
SELECT
    a_sw.main_hand AS A_name,
    b_sw.main_hand AS B_name,
    dwc.win_count,
    dwc.lose_count,
     dwc.win_count + dwc.lose_count AS total_count
    
FROM
    Duo_Weapon_Comps dwc
JOIN
    Simple_Weapon a_sw ON dwc.simple_weapon_A = a_sw.id
JOIN
    Simple_Weapon b_sw ON dwc.simple_weapon_B = b_sw.id;



/*
SELECT *
FROM test_view
ORDER BY total_count DESC
LIMIT 10 OFFSET 0;

select * from test_view ORDER BY total_count DESC limit 10 offset 0;
*/