export async function onRequest(context) {
    // Handle CORS preflight requests
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    try {
        // Get database parameter from query string or request body
        const url = new URL(context.request.url);
        const databaseParam = url.searchParams.get('database') || 'default';
        
        let db;
        if (databaseParam === 'db_gore') {
            if (!context.env.DB_GORE) {
                throw new Error('Database binding "DB_GORE" not found. Please check your Cloudflare Pages D1 database bindings.');
            }
            db = context.env.DB_GORE;
        } else if (databaseParam === 'ws-hub-db') {
            if (!context.env.DB_WS) {
                throw new Error('Database binding "DB_WS" not found. Please check your Cloudflare Pages D1 database bindings.');
            }
            db = context.env.DB_WS;
        } else {
            if (!context.env.DB) {
                throw new Error('Database binding "DB" not found. Please check your Cloudflare Pages D1 database bindings.');
            }
            db = context.env.DB;
        }

        // Get the action and table from the URL parameters
        const { action, table } = context.params;

        // Validate table name to prevent SQL injection
        const validTables = ['chinese_dynasty', 'quote', "vocabulary", "chinese_poem", "english_dialog", "world_history", "lab_warehouse", "fa_svg", "country_info", "equipment_basic_info", "personnel_list"]; // Add more tables as needed
        if (!validTables.includes(table)) {
            throw new Error("Invalid table name");
        }

        // Handle different actions
        switch (action) {
            case 'test':
                // Test connection for specific table
                const testResult = await db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).first();
                const url = new URL(context.request.url);
                const databaseName = url.searchParams.get('database') || 'default';
                return new Response(JSON.stringify({
                    success: true,
                    message: `Successfully connected to ${table} table!`,
                    table: table,
                    database: databaseName
                }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });

            case 'query':
                // Query table data
                const queryResult = await db.prepare(`
                    SELECT * FROM ${table}
                `).all();

                return new Response(JSON.stringify({
                    success: true,
                    table: table,
                    data: queryResult.results || []
                }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });

            case 'upload':
                // Handle data upload
                if (context.request.method !== 'POST') {
                    throw new Error('Upload requires POST method');
                }

                // Parse the request body
                const { data, database: dbName } = await context.request.json();
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('Invalid data format. Expected non-empty array.');
                }

                let insertedCount = 0;
                let deletedCount = 0;

                // Use D1's JavaScript transaction API
                try {
                    // Then insert new data
                    if (table === 'chinese_dynasty') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO chinese_dynasty (Number, Dynasty, Period, Title, Event)
                                VALUES (?, ?, ?, ?, ?)
                            `).bind(
                                row.Number || null,
                                row.Dynasty || null,
                                row.Period || null,
                                row.Title || null,
                                row.Event || null
                            );
                        }));
                    } else if (table === 'quote') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO quote (Number, Type, Chinese, English, Remark_1, Remark_2)
                                VALUES (?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.Number || null,
                                row.Type || null,
                                row.Chinese || null,
                                row.English || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null
                            );
                        }));
                    } else if (table === 'world_history') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO world_history (CATEGORY, REGION, PERIOD, SUB_CATEGORY_1, SUB_CATEGORY_2, TITLE, BACKGROUND, EVENT, IMPACT, REMARK_1, REMARK_2, REMARK_3)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.CATEGORY || null,
                                row.REGION || null,
                                row.PERIOD || null,
                                row.SUB_CATEGORY_1 || null,
                                row.SUB_CATEGORY_2 || null,
                                row.TITLE || null,
                                row.BACKGROUND || null,
                                row.EVENT || null,
                                row.IMPACT || null,
                                row.REMARK_1 || null,
                                row.REMARK_2 || null,
                                row.REMARK_3 || null
                            );
                        }));
                    } else if (table === 'chinese_poem') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO chinese_poem (Title, Number, Poem, Remark_1, Remark_2, Remark_3, Author, Dynasty)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.Title || null,
                                row.Number || null,
                                row.Poem || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null,
                                row.Remark_3 || null,
                                row.Author || null,
                                row.Dynasty || null
                            );
                        }));
                    } else if (table === 'fa_svg') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO fa_svg (Name, Category, Path)
                                VALUES (?, ?, ?)
                            `).bind(
                                row.Name || null,
                                row.Category || null,
                                row.Path || null
                            );
                        }));
                    } else if (table === 'country_info') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO country_info (Country_Code_Fips_10, Factbook_File_Path, Country_Code_Alpha2, Continent_Eng, Country_Name_Eng, Continent_Chn, Country_Name_Chn, Flag_SVG, Other1, Other2, Other3)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.Country_Code_Fips_10 || null,
                                row.Factbook_File_Path || null,
                                row.Country_Code_Alpha2 || null,
                                row.Continent_Eng || null,
                                row.Country_Name_Eng || null,
                                row.Continent_Chn || null,
                                row.Country_Name_Chn || null,
                                row.Flag_SVG || null,
                                row.Other1 || null,
                                row.Other2 || null,
                                row.Other3 || null
                            );
                        }));
                    } else if (table === 'vocabulary') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO vocabulary (
                                    Word_Rank, Word, Word_ID, US_Pronunciation, UK_Pronunciation, 
                                    US_Speech, UK_Speech, Translations, Synonyms, Example_Sentences, 
                                    Remark_1, Remark_2, Remark_3, Remark_4, Remark_5
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.Word_Rank || null,
                                row.Word || null,
                                row.Word_ID || null,
                                row.US_Pronunciation || null,
                                row.UK_Pronunciation || null,
                                row.US_Speech || null,
                                row.UK_Speech || null,
                                row.Translations || null,
                                row.Synonyms || null,
                                row.Example_Sentences || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null,
                                row.Remark_3 || null,
                                row.Remark_4 || null,
                                row.Remark_5 || null
                            );
                        }));
                    } else if (table === 'lab_warehouse') {
                        // First, clear existing data from the table
                        const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
                        deletedCount = deleteResult.meta.changes || 0;

                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO lab_warehouse (
                                    扫描单, 货位, 条码, 数量, 品名, 状态, 单位, 价格, 品牌, 产地, 时间, 作业者, 其他1, 其他2, 其他3, 其他4, 其他5, 其他6, 其他7, 其他8
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.扫描单 || null,
                                row.货位 || null,
                                row.条码 || null,
                                row.数量 || null,
                                row.品名 || null,
                                row.状态 || null,
                                row.单位 || null,
                                row.价格 || null,
                                row.品牌 || null,
                                row.产地 || null,
                                row.时间 || null,
                                row.作业者 || null,
                                row.其他1 || null,
                                row.其他2 || null,
                                row.其他3 || null,
                                row.其他4 || null,
                                row.其他5 || null,
                                row.其他6 || null,
                                row.其他7 || null,
                                row.其他8 || null
                            );
                        }));
                    } else if (table === 'equipment_basic_info') {
                        // First, clear existing data from the table
                        const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
                        deletedCount = deleteResult.meta.changes || 0;

                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO equipment_basic_info (
                                    id, plant, equipment, area, sub_area
                                )
                                VALUES (?, ?, ?, ?, ?)
                            `).bind(
                                row.id || null,
                                row.plant || null,
                                row.equipment || null,
                                row.area || null,
                                row.sub_area || null
                            );
                        }));
                    } else if (table === 'personnel_list') {
                        // First, clear existing data from the table
                        const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
                        deletedCount = deleteResult.meta.changes || 0;

                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO personnel_list (
                                    id, plant, name, function, commitment
                                )
                                VALUES (?, ?, ?, ?, ?)
                            `).bind(
                                row.id || null,
                                row.plant || null,
                                row.name || null,
                                row.function || null,
                                row.commitment || null
                            );
                        }));
                    }

                    insertedCount = data.length;

                    return new Response(JSON.stringify({
                        success: true,
                        message: `Data uploaded successfully. Cleared ${deletedCount} existing records and inserted ${insertedCount} new records.`,
                        insertedCount,
                        deletedCount,
                        totalRows: insertedCount
                    }), {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } catch (error) {
                    throw new Error(`Upload failed: ${error.message}`);
                }

            case 'insert':
                // Handle single record insertion
                if (context.request.method !== 'POST') {
                    throw new Error('Insert requires POST method');
                }

                // Parse the request body
                const { record: insertRecord, database: insertDbName } = await context.request.json();
                if (!insertRecord || typeof insertRecord !== 'object') {
                    throw new Error('Invalid record format. Expected an object.');
                }

                try {
                    let result;
                    
                    if (table === 'equipment_basic_info') {
                        result = await db.prepare(`
                            INSERT INTO equipment_basic_info (
                                id, plant, equipment, area, sub_area
                            )
                            VALUES (?, ?, ?, ?, ?)
                        `).bind(
                            insertRecord.id || null,
                            insertRecord.plant || null,
                            insertRecord.equipment || null,
                            insertRecord.area || null,
                            insertRecord.sub_area || null
                        ).run();
                    } else if (table === 'personnel_list') {
                        result = await db.prepare(`
                            INSERT INTO personnel_list (
                                id, plant, name, function, commitment
                            )
                            VALUES (?, ?, ?, ?, ?)
                        `).bind(
                            insertRecord.id || null,
                            insertRecord.plant || null,
                            insertRecord.name || null,
                            insertRecord.function || null,
                            insertRecord.commitment || null
                        ).run();
                    } else {
                        throw new Error(`Insert operation not supported for table: ${table}`);
                    }

                    return new Response(JSON.stringify({
                        success: true,
                        message: `Record inserted successfully into ${table}.`,
                        insertedId: result.meta.last_row_id
                    }), {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } catch (error) {
                    throw new Error(`Insert failed: ${error.message}`);
                }

            case 'update':
                // Handle record update
                if (context.request.method !== 'POST') {
                    throw new Error('Update requires POST method');
                }

                // Parse the request body
                const { record: updateRecord, id: updateId, database: updateDbName } = await context.request.json();
                if (!updateRecord || typeof updateRecord !== 'object') {
                    throw new Error('Invalid record format. Expected an object.');
                }
                if (!updateId) {
                    throw new Error('ID is required for update operation');
                }

                try {
                    let result;
                    
                    if (table === 'equipment_basic_info') {
                        result = await db.prepare(`
                            UPDATE equipment_basic_info 
                            SET plant = ?, equipment = ?, area = ?, sub_area = ?
                            WHERE id = ?
                        `).bind(
                            updateRecord.plant || null,
                            updateRecord.equipment || null,
                            updateRecord.area || null,
                            updateRecord.sub_area || null,
                            updateId
                        ).run();
                    } else if (table === 'personnel_list') {
                        result = await db.prepare(`
                            UPDATE personnel_list 
                            SET plant = ?, name = ?, function = ?, commitment = ?
                            WHERE id = ?
                        `).bind(
                            updateRecord.plant || null,
                            updateRecord.name || null,
                            updateRecord.function || null,
                            updateRecord.commitment || null,
                            updateId
                        ).run();
                    } else {
                        throw new Error(`Update operation not supported for table: ${table}`);
                    }

                    if (result.meta.changes === 0) {
                        throw new Error(`No record found with ID: ${updateId}`);
                    }

                    return new Response(JSON.stringify({
                        success: true,
                        message: `Record updated successfully in ${table}.`,
                        updatedRows: result.meta.changes
                    }), {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } catch (error) {
                    throw new Error(`Update failed: ${error.message}`);
                }

            case 'delete':
                // Handle record deletion
                if (context.request.method !== 'POST') {
                    throw new Error('Delete requires POST method');
                }

                // Parse the request body
                const { id: deleteId, database: deleteDbName } = await context.request.json();
                if (!deleteId) {
                    throw new Error('ID is required for delete operation');
                }

                try {
                    let result;
                    
                    if (table === 'equipment_basic_info') {
                        result = await db.prepare(`
                            DELETE FROM equipment_basic_info 
                            WHERE id = ?
                        `).bind(deleteId).run();
                    } else if (table === 'personnel_list') {
                        result = await db.prepare(`
                            DELETE FROM personnel_list 
                            WHERE id = ?
                        `).bind(deleteId).run();
                    } else {
                        throw new Error(`Delete operation not supported for table: ${table}`);
                    }

                    if (result.meta.changes === 0) {
                        throw new Error(`No record found with ID: ${deleteId}`);
                    }

                    return new Response(JSON.stringify({
                        success: true,
                        message: `Record deleted successfully from ${table}.`,
                        deletedRows: result.meta.changes
                    }), {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } catch (error) {
                    throw new Error(`Delete failed: ${error.message}`);
                }

            default:
                throw new Error(`Unsupported action: ${action}`);
        }

    } catch (error) {
        console.error("Database error:", error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: error.message,
                details: "If you're seeing a database binding error, please ensure the D1 database is properly bound in your Cloudflare Pages settings."
            }), 
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
}