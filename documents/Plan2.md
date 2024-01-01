# Duo 

## 2v2

### Weapon Comp Data


Duo Match
    id, battle_id, Duo_team_id, Duo_team_id, count

Duo Teams
    id, battle_id, userlog_id, userlog_id, count

User Log
    id, battle_id, uid, name, guild, ally, ip, gearlog_id

Gear Log 
    id, main_hand, off_hand, head, armor, shoes, cape, count



---

### Simple? 
### Duo Weapon Comps
    id, simple_weapon_A, simple_weapon_A, win_count, lose_count

### Simple Weapon
    id, main_hand, used_count


### Get Data From 'battles'
```sql
TABLE battles (
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
```



### battle_id 
#### find members

victory team Names
defeat team Names

=> crawl -> event log

