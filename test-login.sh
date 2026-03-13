#!/bin/bash
cd /var/www/onlyyou/backend
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"days@gmail.com","password":"123qwe"}'
