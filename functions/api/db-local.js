// Local API endpoint for SVG data
// This simulates the database API for local development

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
        // Get the action and table from the URL parameters
        const url = new URL(context.request.url);
        const pathname = url.pathname;
        
        // Extract action and table from path like /functions/api/db/query/fa-svg
        const pathParts = pathname.split('/');
        const action = pathParts[pathParts.length - 2];
        const table = pathParts[pathParts.length - 1];
        
        // Validate table name
        const validTables = ['fa-svg'];
        if (!validTables.includes(table)) {
            throw new Error("Invalid table name");
        }

        // Handle different actions
        switch (action) {
            case 'query':
                // Simulate database query with sample data
                const sampleData = [
                    {
                        Name: "home",
                        Category: "solid",
                        Path: "<path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z'/>"
                    },
                    {
                        Name: "user",
                        Category: "solid",
                        Path: "<path d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'/>"
                    },
                    {
                        Name: "heart",
                        Category: "solid",
                        Path: "<path d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'/>"
                    },
                    {
                        Name: "star",
                        Category: "solid",
                        Path: "<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'/>"
                    },
                    {
                        Name: "search",
                        Category: "solid",
                        Path: "<path d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'/>"
                    },
                    {
                        Name: "settings",
                        Category: "solid",
                        Path: "<path d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'/><path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/>"
                    },
                    {
                        Name: "download",
                        Category: "solid",
                        Path: "<path d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'/>"
                    },
                    {
                        Name: "upload",
                        Category: "solid",
                        Path: "<path d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z'/>"
                    },
                    {
                        Name: "envelope",
                        Category: "solid",
                        Path: "<path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'/><path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'/>"
                    },
                    {
                        Name: "phone",
                        Category: "solid",
                        Path: "<path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z'/>"
                    },
                    {
                        Name: "camera",
                        Category: "solid",
                        Path: "<path d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 1H8.828a2 2 0 00-1.414.586L6.293 2.707A1 1 0 015.586 3H4zm6 7a3 3 0 11-6 0 3 3 0 016 0z'/>"
                    },
                    {
                        Name: "music",
                        Category: "solid",
                        Path: "<path d='M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z'/>"
                    },
                    {
                        Name: "book",
                        Category: "solid",
                        Path: "<path d='M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z'/>"
                    },
                    {
                        Name: "pencil-alt",
                        Category: "solid",
                        Path: "<path d='M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z'/><path d='M2 6v12a2 2 0 002 2h12a2 2 0 002-2V8h-2v10H4V6h2z'/>"
                    },
                    {
                        Name: "trash",
                        Category: "solid",
                        Path: "<path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z'/><path fill-rule='evenodd' d='M4 5a2 2 0 012-2 1 1 0 000 2H3a1 1 0 100 2h1v8a2 2 0 002 2h8a2 2 0 002-2V7h1a1 1 0 100-2h-3a1 1 0 100-2 2 2 0 012 2v10a4 4 0 01-4 4H8a4 4 0 01-4-4V5z' clip-rule='evenodd'/>"
                    },
                    {
                        Name: "folder",
                        Category: "solid",
                        Path: "<path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'/>"
                    },
                    {
                        Name: "file",
                        Category: "solid",
                        Path: "<path d='M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z'/>"
                    },
                    {
                        Name: "calendar",
                        Category: "solid",
                        Path: "<path d='M6.75 3a.75.75 0 00-1.5 0v.75c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75V3a.75.75 0 00-1.5 0v.75h-8.5V3zM3 8.25a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 8.25zm0 4.5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z'/><path fill-rule='evenodd' d='M3 5.25A2.25 2.25 0 015.25 3h9.5A2.25 2.25 0 0117 5.25v9.5A2.25 2.25 0 0114.75 17H5.25A2.25 2.25 0 013 14.75v-9.5zm2.25-.75a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h9.5a.75.75 0 00.75-.75v-9.5a.75.75 0 00-.75-.75H5.25z' clip-rule='evenodd'/>"
                    },
                    {
                        Name: "clock",
                        Category: "solid",
                        Path: "<path d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'/>"
                    },
                    {
                        Name: "bell",
                        Category: "solid",
                        Path: "<path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z'/>"
                    }
                ];

                return new Response(JSON.stringify({
                    success: true,
                    table: table,
                    data: sampleData
                }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });

            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}