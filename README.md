[![Netlify Status](https://api.netlify.com/api/v1/badges/79e1e1a6-8fcb-4e4d-81e5-8e7d6325ca74/deploy-status)](https://app.netlify.com/sites/quicktarot/deploys)

[![Quick Tarot Screenshot][screen]](https://quicktarot.netlify.app/)

# Quick Tarot

Quick Tarot is a NodeJS and vanilla JavaScript application that allows you to draw random tarot cards. Providing a fast and efficient way to generate sets of randomized cards, the application combines the Tarot Car API (below) with the original Rider-Waite Smith cards, which have been made accessible by Luciella Scarlett. 

---

## Tarot Card API
[_Explore this repo_](https://github.com/ekelen/tarot-api)
> For all your cybermysticism needs. 🔮

Provides information parsed from AE Waite's The Pictorial Key to the Tarot, meeting the OpenAPI 3 spec. This was created as a friendly introduction to REST APIs.

---

## API Usage

1. [See full documentation + play with the API on SwaggerHub](https://app.swaggerhub.com/apis/ekswagger/tarot-api/1.3)

2. See below for quick start

### Quick start

JS:

```javascript
fetch("https://tarot-api-3hv5.onrender.com/api/v1/cards/random?n=10")
  .then(function (response) {
    return response.json();
  })
  .then(function (response) {
    // handle ten random cards
  })
  .catch(function (error) {
    // handle what went wrong
  });
```

### Condensed documentation

| GET path                      | Result                                  | Params                                                                                                          |
| :---------------------------- | --------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `/api/v1/` or `/api/v1/cards` | return all cards                        |                                                                                                                 |
| `/api/v1/cards/:name_short`   | return card with specified `name_short` | **minors:** `/swac`, `/wa02`, ..., `/cupa`, `/pequ`, `/waqu`, `/swki`, **majors** `/ar01`, `/ar02`, ...`/ar[n]` |
| `/api/v1/cards/search`        | search all cards                        | `q={text}`, `meaning={text}`, `meaning_rev={text}`                                                              |
| `/api/v1/cards/random`        | get random card(s)                      | _optional_ `n={integer <= 78}`                                                                                  |

### Examples:

Get all cards with word "peace" in meaning (reversed or upright):

https://tarot-api-3hv5.onrender.com/api/v1/cards/search?meaning=peace (free dyno == super slow, sorry)

Get 10 random cards:

https://tarot-api-3hv5.onrender.com/api/v1/cards/random?n=10

Get the Knight of Wands:

https://tarot-api-3hv5.onrender.com/api/v1/cards/wakn

---

## 💻 Local development

(Novice-friendly!)

1. You are welcome to [just grab the JSON file](./static/card_data.json) that serves as the data source and use it for your own projects.

2. Clone or fork this repository and install dependencies locally. Requires Node 10.0.0 or higher, and npm 6.0.0 or higher.

```sh
git clone https://github.com/gitmohamed/quicktarot.git
# or git@github.com:gitmohamed/quicktarot.git

# -OR- click fork on this project's Github page, then:

git clone https://github.com/YOUR-USERNAME/quicktarot.git
```

Then:

```sh
cd quicktarot

npm install

npm run dev
```

---

[screen]: ./static/screenshot.png