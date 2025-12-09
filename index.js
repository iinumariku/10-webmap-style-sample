// Maplibre GL JSを使用してウェブ地図を作成するJavaScriptファイル

// 新しい地図オブジェクトを作成します
const map = new maplibregl.Map({
    // container: 地図を表示するHTML要素のIDを指定
    // index.htmlの<div id="map"></div>に地図が表示されます
    container: 'map',

    // style: 地図の見た目（スタイル）を決めるURL
    style: {
      version: 8,

      // ソース。地図データの取得元を指定
      sources: {
        // raster
        'raster-source': {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        },

        // geojson (URL 指定)
        'geojson-sample-source-1': {
          type: 'geojson',
          data: './sample.geojson',
        },

        // geojson (オブジェクト指定)
        'geojson-sample-source-2': {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  name: 'Pointサンプル'
                },
                geometry: {
                  coordinates: [136.57475446318807, 35.799855185158634],
                  type: 'Point'
                }
              },
              {
                type: 'Feature',
                properties: {
                  name: 'LineStringサンプル'
                },
                geometry: {
                  coordinates: [
                    [136.87533029613263, 35.7297616678965],
                    [136.53280435975688, 35.65136408782364],
                    [136.74068408881897, 35.44455049551661]
                  ],
                  type: 'LineString'
                }
              },
              {
                type: 'Feature',
                properties: {
                  name: 'Polygonサンプル'
                },
                geometry: {
                  coordinates: [
                    [
                      [135.84804460814843, 35.80861515928164],
                      [135.84804460814843, 35.66637305952217],
                      [136.2596903980534, 35.66637305952217],
                      [136.2596903980534, 35.80861515928164],
                      [135.84804460814843, 35.80861515928164],
                    ]
                  ],
                  type: 'Polygon'
                }
              }
            ]
          },
        },

        // ベクトルタイル
        'vector-source': {
          type: 'vector',
          url: 'https://demotiles.maplibre.org/tiles/tiles.json',
        }
      },

      // レイヤ。配置順に描画される
      layers: [
        // 背景を指定するレイヤ
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': 'hsl(50, 80%, 70%)'
          }
        },

        // ラスタータイルレイヤ
        {
          id: 'raster-source-layer',
          type: 'raster',
          source: 'raster-source',
        },

        
        // Circle レイヤ
        {
          id: 'circle-layer',
          type: 'circle',
          source: 'geojson-sample-source-2',
          filter: ['==', '$type', 'Point'], // 点のみを対象
          layout: {
            'visibility': 'visible' // レイヤの表示・非表示
          },
          paint: {
            "circle-radius"         : 8,           // 半径（ピクセル）
            "circle-color"          : "#ff0000", // 塗りつぶし色
            "circle-opacity"        : 1.0,         // 塗りつぶし透明度
            "circle-stroke-color"   : "#ffffff", // 境界線色
            "circle-stroke-width"   : 2,           // 境界線幅
            "circle-stroke-opacity" : 1.0          // 境界線透明度
          },
        },

        // Symbol レイヤ
        {
          id: 'symbol-layer',
          type: 'symbol',
          source: 'geojson-sample-source-2',
          layout: {
            'text-field' : ['get', 'name'], // プロパティ "name" の値をラベルに使用
            'text-size'  : 12,
            'text-anchor': 'bottom',
          },
          paint: {
            'text-color'     : '#000000', // 文字色
            'text-halo-color': '#ffffff', // 文字の縁取り色
            'text-halo-width': 2,           // 文字の縁取り幅
          },
        },

        // line レイヤ
        {
          id: 'line-layer',
          type: 'line',
          source: 'geojson-sample-source-2',
          filter: ['==', '$type', 'LineString'], // 線分のみを対象
          paint: {
            'line-color': '#0000ff', // 線の色
            'line-width': 4,           // 線の幅
          },
        },

        // polygon レイヤ
        {
          id: 'polygon-layer',
          type: 'fill',
          source: 'geojson-sample-source-2',
          filter: ['==', '$type', 'Polygon'], // ポリゴンのみを対象
          paint: {
            'fill-color'  : '#00ff00', // 塗りつぶし色
            'fill-opacity': 0.5,       // 塗りつぶし透明度
          },
        },

        // Expression の 例
        {
          id: 'ritsumeikan-icon-layer',
          type: 'circle',
          source: 'geojson-sample-source-1',
          // amenity プロパティが university の地物を対象とする Expression
          filter:['==', ['get', 'amenity'], 'university'],
          paint: {
            "circle-radius"         : 10,
            "circle-color"          : [
              'case',
              ['<=', ['get', 'published_year'], 1900],
              "#ff0000", // 1900年以前に創立された大学は赤色
              "#00ff00"  // それ以外は緑色
            ],
            "circle-opacity"        : 1.0,
            "circle-stroke-color"   : "#000000",
            "circle-stroke-width"   : 2,
            "circle-stroke-opacity" : 1.0
          },
        },

        // Expression の 例
        {
          id: 'university-layer',
          type: 'symbol',
          source: 'geojson-sample-source-1',
          // amenity プロパティが university の地物を対象とする Expression
          filter:['==', ['get', 'amenity'], 'university'],
          layout: {
            'text-field': [
              // 文字列を連結する Expression
              'concat',
              ['get', 'name:en'],
              '\n',
              '（',
              ['get', 'name'],
              '）',
              '\n',
              '明治',
              [
                // 数字を文字列に変換する Expression
                'to-string',
                [
                  // 西暦から和暦に変換する減算の Expression
                  '-',
                  ['get', 'published_year'],
                  1867,
                ],
              ],
              '年創立',
            ],
            'text-size'  : 12,
            'text-offset': [0, 5],
            'text-anchor': 'bottom',
          },
          paint: {
            'text-color'     : '#3333ff',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        },

        // ベクトルタイルレイヤ は次回の授業で解説します
        // TODO: 簡単な Interpolate の例
      ]
    },

    // center: 地図の初期表示位置を経度・緯度で指定
    // [経度, 緯度] の順番で指定します
    center: [139.6917, 35.6895], // 東京駅付近

    // zoom: 地図の初期ズームレベルを指定
    // 数値が大きいほど拡大表示されます
    zoom: 1,

    // hash: URLのハッシュ部分に地図の位置情報を反映させるかどうか
    hash: true,

    maxZoom: 18,
    minZoom: 4,
});

// クリックした時のインタラクション
map.on('click', function (e) {
    const features = map.queryRenderedFeatures(e.point, { layers: ['my-data_circle-layer', 'my-data_symbol-layer'] });
    if(features.length > 0){
        const feature = features[0];
        alert('クリックした地物:\n' + feature.properties.name);
    }
})

