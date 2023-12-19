# Crawler

### Crawler PLAN
0. Crawler Battle Log
1. Check BattleID in DB
2. Check Players Count: [4, 10, 20]
3. Crawler Event Log
4. Loop
    1. Check Group Member Count: [2, 5, 10]
    2. Check IP Range: [1100 ~ 1450]
    
    + Extra Build
    3. If Group Member Count != 2 
        1. Check Healer 
    
    4. Find Team 
        1. Get All Members from Battle Log
        2. Find First Team in First Event Log
            1. Find Victory Team and Defeat Team

5. Save DB


# Process

# Save DB.



### DB PLAN
#### default
id
updated_at
created_at



#### battlelog ![https://gameinfo-sgp.albiononline.com/api/gameinfo/battles?offset=0&limit=1&sort=recent]
battle_id
totalFame
totalKills
players

type : 2v2, 5v5, 10v10

victory_team : "name"."weapon", ""."", ""."", 
defeat_team : 
##### TODO : split team data

#### eventlog   ![https://gameinfo-sgp.albiononline.com/api/gameinfo/events/battle/168783844?offset=0&limit=10]




