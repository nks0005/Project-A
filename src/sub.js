

const { fetchDataFromUrl } = require('./util/crawler');
const { print_log } = require('./util/print');

const mysql = require('mysql2/promise');
const dbConfig = require('./config/db_config.js');

function extractWeaponName(str) {


    let tmp = str;
    let index;

    if (str[0] == 'T') {
        index = str.indexOf('_');
        if (index !== -1) {
            tmp = tmp.substring(index + 1);
        }
    }

    index = tmp.indexOf('@');
    if (index !== -1) {
        tmp = tmp.substring(0, index);
    }

    return tmp;
}

function getWeapons(team) {
    if (team === undefined) {
        console.error("Team information is undefined or null.");
    }

    let str_spliteds = team.split(', ');

    let names = new Array(str_spliteds.length);
    for (let i = 0; i < str_spliteds.length; i++) {
        names[i] = str_spliteds[i].split('.')[1];
        names[i] = extractWeaponName(names[i]);
    }

    return names;
}

async function sub() {
    // DB로 부터 데이터를 긁어온다 

    let rows, fields;
    try {
        // 데이터베이스 연결
        const connection = await mysql.createConnection(dbConfig);

        [rows, fields] = await connection.execute('SELECT victory_team, defeat_team, battle_id FROM battles WHERE process=0 AND type=22 LIMIT 100');

        await connection.end();
    } catch (err) {
        console.log(err);
        return;
    }


    if (rows == 0) return;

    for (const row of rows) {
        console.log(row);

        console.log("=============");
        console.log(row.victory_team);
        console.log(row.defeat_team);
        console.log("=============");

        let victory_weapon = getWeapons(row.victory_team);
        let defeat_weapon = getWeapons(row.defeat_team);


        console.log("=============");
        console.log(victory_weapon);
        console.log(defeat_weapon);
        console.log("=============");
        // 트랜젝션
        const connection = await mysql.createConnection(dbConfig);
        try {


            await connection.beginTransaction();


            // 승자

            // Simple_Weapon에 데이터 삽입
            {
                const [insertSimpleResult_1] = await connection.execute(
                    'INSERT INTO Simple_Weapon (main_hand, used_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE used_count = used_count + 1',
                    [victory_weapon[0]]
                );

                const simpleWeaponId_1 = insertSimpleResult_1.insertId; // 삽입된 무기 ID

                // Simple_Weapon에 데이터 삽입
                const [insertSimpleResult_2] = await connection.execute(
                    'INSERT INTO Simple_Weapon (main_hand, used_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE used_count = used_count + 1',
                    [victory_weapon[1]]
                );

                const simpleWeaponId_2 = insertSimpleResult_2.insertId; // 삽입된 무기 ID


                // Duo_Weapon_Comps에 데이터 삽입 
                await connection.execute(
                    'INSERT INTO Duo_Weapon_Comps (simple_weapon_A, simple_weapon_B, win_count, lose_count) VALUES (?, ?, 1, 0) ON DUPLICATE KEY UPDATE win_count = win_count + 1',
                    [simpleWeaponId_1, simpleWeaponId_2]
                );
            }

            // end 승자


            // 패자
            // Simple_Weapon에 데이터 삽입
            {
                const [insertSimpleResult_1] = await connection.execute(
                    'INSERT INTO Simple_Weapon (main_hand, used_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE used_count = used_count + 1',
                    [defeat_weapon[0]]
                );

                const simpleWeaponId_1 = insertSimpleResult_1.insertId; // 삽입된 무기 ID

                // Simple_Weapon에 데이터 삽입
                const [insertSimpleResult_2] = await connection.execute(
                    'INSERT INTO Simple_Weapon (main_hand, used_count) VALUES (?, 1) ON DUPLICATE KEY UPDATE used_count = used_count + 1',
                    [defeat_weapon[1]]
                );

                const simpleWeaponId_2 = insertSimpleResult_2.insertId; // 삽입된 무기 ID


                // Duo_Weapon_Comps에 데이터 삽입 
                await connection.execute(
                    'INSERT INTO Duo_Weapon_Comps (simple_weapon_A, simple_weapon_B, win_count, lose_count) VALUES (?, ?, 0, 1) ON DUPLICATE KEY UPDATE lose_count = lose_count + 1',
                    [simpleWeaponId_1, simpleWeaponId_2]
                );


                // 해당 battle log의 process를 1로 설정
                
                await connection.execute(
                    'UPDATE battles SET process=1 WHERE battle_id=?',
                    [row.battle_id]
                );
                

                await connection.commit();
                console.log('트랜잭션 완료');

                await connection.end();
            }


        } catch (error) {
            // 롤백 처리
            await connection.rollback();
            console.error('트랜잭션 롤백', error);
        }
    }
}

module.exports = {
    sub
};