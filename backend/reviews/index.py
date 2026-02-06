import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для работы с отзывами: получение списка и добавление новых"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT id, username, rating, comment, created_at 
                FROM reviews 
                ORDER BY created_at DESC 
                LIMIT 50
            """)
            rows = cur.fetchall()
            reviews = []
            for row in rows:
                reviews.append({
                    'id': row[0],
                    'username': row[1],
                    'rating': row[2],
                    'comment': row[3],
                    'created_at': row[4].isoformat() if row[4] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'reviews': reviews}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            username = body.get('username', '').strip()
            rating = body.get('rating', 0)
            comment = body.get('comment', '').strip()
            
            if not username or not comment:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Username and comment are required'}),
                    'isBase64Encoded': False
                }
            
            if rating < 1 or rating > 5:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Rating must be between 1 and 5'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO reviews (username, rating, comment) VALUES (%s, %s, %s) RETURNING id, created_at",
                (username, rating, comment)
            )
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'review': {
                        'id': result[0],
                        'username': username,
                        'rating': rating,
                        'comment': comment,
                        'created_at': result[1].isoformat()
                    }
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
