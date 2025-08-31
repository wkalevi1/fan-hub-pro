# Fan Hub Pro - API Contracts 🏆

## 📋 Integración Frontend & Backend

### 🎯 **Datos Mock Actuales (Frontend)**
Los siguientes datos mock en `/frontend/src/components/mockData.js` serán reemplazados:

1. **outfitData** → API `/api/outfits`
2. **questionsData** → API `/api/questions`
3. **wallpapersData** → API `/api/wallpapers`
4. **socialLinks** → Mantenido estático (URLs reales)

---

## 🚀 **API Endpoints - Contratos**

### 1. **Outfits & Voting** 🏆

#### GET `/api/outfits` - Lista de outfits con ranking
```json
{
  "success": true,
  "data": [
    {
      "_id": "outfit_id",
      "title": "Golden Hour Athleisure",
      "image": "https://...",
      "votes": 156,
      "percentage": 28,
      "ranking": 1,
      "comments": [
        {
          "text": "¡Amor total! 💖",
          "emoji": "💖",
          "fanId": {...}
        }
      ]
    }
  ]
}
```

#### POST `/api/votes` - Votar por outfit
```json
// Request
{
  "outfitId": "outfit_id",
  "fanId": "fan_id", // opcional
  "voteType": "like"
}

// Response
{
  "success": true,
  "message": "¡Voto registrado!",
  "data": {
    "outfit": {
      "votes": 157,
      "percentage": 29
    }
  }
}
```

#### POST `/api/outfits/:id/comment` - Añadir comentario
```json
// Request
{
  "text": "¡Me encanta!",
  "emoji": "💖",
  "fanId": "fan_id"
}
```

---

### 2. **Q&A System** 💬

#### GET `/api/questions` - Preguntas respondidas
```json
{
  "success": true,
  "data": [
    {
      "_id": "question_id",
      "question": "¿Cuál es tu rutina favorita para glúteos?",
      "answer": "Mi rutina incluye...",
      "answerType": "text", // "text" | "video"
      "videoThumbnail": "https://...", // if video
      "videoDuration": "4:32", // if video
      "likes": 45,
      "category": "fitness",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/questions` - Enviar pregunta
```json
// Request
{
  "question": "¿Cuál es tu suplemento favorito?",
  "category": "fitness",
  "fanId": "fan_id" // opcional
}

// Response
{
  "success": true,
  "message": "¡Pregunta enviada! Stephanie responderá pronto.",
  "data": {
    "_id": "new_question_id",
    "status": "pending"
  }
}
```

#### POST `/api/questions/:id/like` - Like a pregunta
```json
{
  "success": true,
  "data": {
    "likes": 46
  }
}
```

---

### 3. **Wallpapers** 🖼

#### GET `/api/wallpapers` - Lista de wallpapers
```json
// Query params: ?category=lifestyle&page=1&limit=12
{
  "success": true,
  "data": [
    {
      "_id": "wallpaper_id",
      "title": "Golden Hour Dreams",
      "image": "https://...",
      "category": "lifestyle",
      "downloads": 247,
      "resolution": {
        "width": 1080,
        "height": 1920
      }
    }
  ],
  "pagination": {
    "page": 1,
    "total": 50,
    "pages": 5
  }
}
```

#### GET `/api/wallpapers/categories` - Categorías disponibles
```json
{
  "success": true,
  "data": [
    { "_id": "all", "count": 50 },
    { "_id": "lifestyle", "count": 15 },
    { "_id": "fitness", "count": 12 }
  ]
}
```

#### POST `/api/wallpapers/:id/download` - Trackear descarga
```json
// Request
{
  "fanId": "fan_id" // opcional
}

// Response
{
  "success": true,
  "message": "¡Descarga iniciada!",
  "data": {
    "downloads": 248,
    "downloadUrl": "https://..."
  }
}
```

---

### 4. **Fan System** 👑

#### GET `/api/fans/top` - Top fans
```json
{
  "success": true,
  "data": [
    {
      "_id": "fan_id",
      "username": "StephanieFan123",
      "avatar": "https://...",
      "points": 1250,
      "level": 12,
      "badges": [
        {
          "name": "Super Fan",
          "icon": "👑",
          "description": "Reached level 10"
        }
      ]
    }
  ]
}
```

#### POST `/api/fans` - Crear perfil fan
```json
// Request
{
  "username": "NewFan2025",
  "email": "fan@example.com", // opcional
  "bio": "Stephanie's biggest fan!"
}
```

---

## 🔄 **Cambios Frontend Necesarios**

### 1. **Reemplazar Mock Data**
```javascript
// Antes (mock)
import { outfitData } from './mockData';

// Después (API real)
const fetchOutfits = async () => {
  const response = await axios.get(`${API}/outfits`);
  return response.data;
};
```

### 2. **Actualizar Componentes**

#### OutfitRanking.js:
- ✅ `handleVote()` → POST `/api/votes`
- ✅ `addEmoji()` → POST `/api/outfits/:id/comment`
- ✅ `useEffect()` → GET `/api/outfits`

#### QASection.js:
- ✅ `handleSubmitQuestion()` → POST `/api/questions`
- ✅ `likeAnswer()` → POST `/api/questions/:id/like`
- ✅ `useEffect()` → GET `/api/questions`

#### WallpaperGallery.js:
- ✅ `handleDownload()` → POST `/api/wallpapers/:id/download`
- ✅ `filteredWallpapers` → GET `/api/wallpapers?category=X`
- ✅ `useEffect()` → GET `/api/wallpapers/categories`

### 3. **Estado Global**
Implementar Context API para:
- Estado de usuario/fan autenticado
- Votos realizados (persistencia)
- Preguntas enviadas
- Descargas realizadas

---

## 🎮 **Sistema de Gamificación**

### Puntos por Actividad:
- **Votar outfit**: +10 puntos
- **Enviar pregunta**: +15 puntos
- **Descargar wallpaper**: +5 puntos
- **Comentar**: +5 puntos

### Badges Automáticos:
- **Voter** (🗳️): 10 votos
- **Super Voter** (🏆): 50 votos
- **Curious** (❓): 5 preguntas
- **Rising Star** (⭐): Nivel 5
- **Super Fan** (👑): Nivel 10

### Niveles:
- **Nivel = floor(puntos / 100) + 1**
- Cada 100 puntos = 1 nivel

---

## 🚨 **Rate Limiting & Validación**

### Límites por IP:
- **Votos**: 1 por outfit por IP
- **Preguntas**: 5 por día por IP
- **Comentarios**: 20 por día por IP

### Validación:
- **Preguntas**: máx 500 caracteres
- **Comentarios**: máx 200 caracteres
- **Usernames**: 3-30 caracteres, únicos

---

## 📱 **Funcionalidades Premium**

### ✅ **Ya Implementado Frontend:**
- Loader animado dorado
- Modo oscuro golden hour
- Badges de gamificación
- Animaciones de scroll
- Filtros golden hour en imágenes
- Sistema de coronas para top fans

### 🔜 **Backend Ready:**
- API completa funcional
- Sistema de puntos y badges
- Rate limiting
- Validaciones
- Estadísticas y analytics

---

## 🎯 **Próximos Pasos**

1. **Integrar APIs** en componentes frontend
2. **Implementar Context API** para estado global
3. **Poblar base de datos** con outfits/wallpapers iniciales
4. **Testing completo** de flujos E2E
5. **Optimizar performance** y caching

¡El Fan Hub Pro está listo para ser una aplicación full-stack completa! 🌟👑