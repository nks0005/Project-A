/**
 * # main.js
 * 
 * Control Crawler and Process and Save DB
 */

const { fetchDataFromUrl } = require('./util/crawler');
const { print_log } = require('./util/print');

const mysql = require('mysql2/promise');
const dbConfig = require('./config/db_config.js');
const { start } = require('repl');





/**
 * DEFINE / ENV
 */
const MAX_LIMIT = 50;
const LOOP_COUNT_BATTLELOG = 10;

const battleIds = new Set();

/**
 * main function
 */
async function main() {
    // Crawler Battle Log

    // lc = loop_count
    for (let lc = 0; lc < LOOP_COUNT_BATTLELOG; lc++) {
        battleIds.clear();
        const offset = lc === 0 ? 0 : lc * 50;

        const url_battlelog = `https://gameinfo-sgp.albiononline.com/api/gameinfo/battles?offset=${offset}&limit=${MAX_LIMIT}&sort=recent`;
        print_log(url_battlelog);

        // Crawler Battle log
        const data_recent_battlelog = await fetchDataFromUrl(url_battlelog);
        if (data_recent_battlelog === null || data_recent_battlelog === undefined) {
            print_log(`Can't getting Battlelog : ${url_battlelog}`);
            continue;
        }




        // Check Players Count
        // TODO: define this in util/battlelog.js
        let check_battlelog = 0; // 22, 55, 1010
        let check_totalKills = 0;
        let check_players_count = 0;
     

        for (const battle of data_recent_battlelog) {
            const totalKills = battle.totalKills;
            const totalPlayers = Object.keys(battle.players).length;
            

            try {
                const connection = await mysql.createConnection(dbConfig);
                const checkQuery = 'SELECT * FROM battles WHERE battle_id = ?';
                const [existingData] = await connection.execute(checkQuery, [battle.id]);

                if (existingData.length > 0) {
                    console.log('이미 해당 데이터가 존재합니다.');
                } else {
                    // 2v2, 5v5, 10v10
                    if ((totalPlayers === 4 && totalKills >= 2) ||
                        (totalPlayers === 10 && totalKills >= 5) ||
                        (totalPlayers === 20 && totalKills >= 10)) {
                        check_totalKills = totalKills;
                        check_players_count = totalPlayers;
                        check_battlelog = (check_players_count / 2) * 11;

                        // add data in Set
                        print_log(`Add Battle ID : ${battle.id}`);
                        battleIds.add(battle.id);
                    }
                }

                await connection.end();
            } catch (error) {
                console.error('에러 발생:', error);
            }
        }




        // Process Event Log
        for (const id of battleIds) {
            print_log(`Process... Battle ID : ${id}`);

            // Get All Members from Battle Log


            const url_battlelog_id = `https://gameinfo-sgp.albiononline.com/api/gameinfo/battles/${id}`;
            const data_battlelog_id = await fetchDataFromUrl(url_battlelog_id);
            if (data_battlelog_id === null || data_battlelog_id === undefined) {
                print_log(`Can't getting Battlelog_id : ${url_battlelog_id}`);
                continue;
            }

            const players = data_battlelog_id.players;
            const totalKills = data_battlelog_id.totalKills;
            const totalFame = data_battlelog_id.totalFame;
            const countPlayers = Object.keys(players).length;
            const timeStampString = data_battlelog_id.startTime;
            const startTime = new Date(timeStampString).toISOString().slice(0, 19).replace('T', ' ');
            console.log(`startTime : ${startTime}`);
            const name_players = new Set();

            for (const uid in players) {
                name_players.add(players[uid].name);
            }



            const url_eventlog = `https://gameinfo-sgp.albiononline.com/api/gameinfo/events/battle/${id}?offset=0&limit=50`;
            print_log(url_eventlog);



            // Crawler Event log
            const data_eventlog = await fetchDataFromUrl(url_eventlog);
            if (data_eventlog === null || data_eventlog === undefined) {
                print_log(`Can't getting Eventlog : ${url_eventlog}`);
                continue;
            }

            // Loop 
            let check_group_member_count = false; // if true. don't save
            let check_ip_range = false; // if true. don't save

            const A_team = new Set();
            const B_team = new Set();
            name_players.forEach(member => {
                B_team.add(member);
            });
            const Victims = new Set();

            // data


            data_eventlog.forEach(battle => {
                // Check Group Member Count: [2, 5, 10]
                const group_member_count = battle.groupMemberCount;

                /**
                 * Check IP Range
                 * @param {int} ip 
                 * @returns true or false
                 */
                const check_ip = (ip) => {
                    if (ip === null || ip === undefined) return false;

                    if (ip == 0 || ((ip >= 1000) && (ip <= 1450))) {
                        return true;
                    }
                    return false;
                };

                const killer_ip = battle.Killer.AverageItemPower;
                const victim_ip = battle.Victim.AverageItemPower;
                if (!check_ip(killer_ip)) {
                    check_ip_range = true;
                    print_log(`!check_ip(killer_ip) ${killer_ip}`);
                }
                if (!check_ip(victim_ip)) {
                    check_ip_range = true;
                    print_log(`!check_ip(killer_ip) ${victim_ip}`);
                }

                /**
                 * Check Group Count
                 * @param {int} count 
                 * @returns true or false
                 */
                const check_group = (count) => {
                    if (count === null || count === undefined) return false;
                    if (count == 2 || count == 5 || count == 10) return true;
                    return false;
                };

                if (!check_group(group_member_count)) {
                    check_group_member_count = true;
                    print_log(`!check_group ${group_member_count}`);
                }

                // check 
                if (check_ip_range || check_group_member_count) return;

                // If !A_team -> Make A team and B team
                print_log(`${A_team.size}`);
                if (A_team.size == 0) {
                    for (let i = 0; i < battle.GroupMembers.length; i++) {
                        print_log(`A 그룹 맴버 테스트 : ${battle.GroupMembers[i].Name}`);
                        A_team.add(battle.GroupMembers[i].Name);
                    }
                }
                // Make B_team
                if (A_team.size > 0 && B_team.size > A_team.size) {
                    A_team.forEach(member => {
                        //print_log(`A 그룹 맴버 테스트 : ${member}`);
                        B_team.delete(member);
                    });

                    B_team.forEach(member => {
                        print_log(`B 그룹 맴버 테스트 : ${member}`);
                    });
                }

                // Save Victims for Finding V, D teams
                const victim_name = battle.Victim.Name;
                Victims.add(victim_name)

            });

            // check
            if (check_ip_range || check_group_member_count) continue;


            let victory_team;
            let defeat_team;
            // Victims

            let count_a_team = 0;
            let count_b_team = 0;

            Victims.forEach((name) => {
                if (A_team.has(name)) count_a_team++;
                if (B_team.has(name)) count_b_team++;
            });

            if (count_a_team < count_b_team) {
                victory_team = A_team;
                defeat_team = B_team;
            }
            else {
                victory_team = B_team;
                defeat_team = A_team;
            }



            // SAVE DB
            const type = countPlayers === 20 ? 1010 : countPlayers === 10 ? 55 : 22;
            console.log(`====== TEST ======`);
            console.log(`${id}\t${totalFame}\t${totalKills}\t${countPlayers}\t${type}`);
            console.log(`== VICTORY TEAM ==`);

            const vteam = Array.from(victory_team).join(', ');
            console.log(vteam);
            // victory_team.forEach((name) => {
            //     console.log(`${name}`);
            // });

            console.log(`== DEFEAT TEAM ==`);
            const dteam = Array.from(defeat_team).join(', ');
            console.log(dteam);
            // defeat_team.forEach((name) => {
            //     console.log(`${name}`);
            // });


            try {
                // 데이터베이스 연결
                const connection = await mysql.createConnection(dbConfig);

                // INSERT 쿼리 생성
                const insertQuery = `INSERT INTO battles (battle_id, totalFame, totalKills, countPlayers, victory_team, defeat_team, battle_time, type ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                // 데이터
                const data = [
                    id, // battle_id
                    totalFame, // totalFame
                    totalKills, // totalKills
                    countPlayers, // countPlayers
                    vteam, // victory_team
                    dteam, // defeat_team
                    startTime,
                    type // type
                    
                ];

                // INSERT 실행
                const [results] = await connection.execute(insertQuery, data);
                console.log('데이터 삽입 완료:', results);

                // 연결 종료
                await connection.end();
            } catch (error) {
                console.error('에러 발생:', error);
            }
        }


    }
}

module.exports = {
    main
};