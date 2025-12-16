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
      // ラスター（地理院タイル）
      'raster-source': {
        type: 'raster',
        tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
      },

      // 大学ポイント
      // 'geojson-sample-source-1': {
      //   type: 'geojson',
      //   data: './sample.geojson',
      // },

      // バス停ポイント
      'bus-point-source': {
        type: 'geojson',
        data: './bus_point.geojson',
      },

      // バス路線
      'bus-line-source': {
        type: 'geojson',
        data: './bus_line.geojson',
      },
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

      // バス路線
      {
        id: 'bus-line-layer',
        type: 'line',
        source: 'bus-line-source',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#0066cc',
          'line-width': 2,
        },
      },

      // バス停（ポイント）
      {
        id: 'bus-point-layer',
        type: 'circle',
        source: 'bus-point-source',
        filter: ['==', '$type', 'Point'],
        layout: {
          'visibility': 'visible'
        },
        paint: {
          'circle-radius': 5,
          'circle-color': [
            'case',
            ['==', ['get', 'P11_002'], '京都市'],
            'hsla(156, 83%, 52%, 1.00)', // 京都市は緑色
            'hsl(30, 100%, 50%)'  // それ以外はオレンジ色
          ],
          'circle-opacity': 0.9,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
          'circle-stroke-opacity': 0.9
        },
      },

      // バス停ラベル（P11_011などが無ければデフォルト文字列）
      {
        id: 'bus-point-label-layer',
        type: 'symbol',
        source: 'bus-point-source',
        layout: {
          'text-field': [
            'coalesce',
            ['get', 'P11_001'],
            '停留所'
          ],
          'text-size': 11,
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      },

      // Expression の 例（大学ポイント）
  //     {
  //       id: 'ritsumeikan-icon-layer',
  //       type: 'circle',
  //       source: 'geojson-sample-source-1',
  //       // amenity プロパティが university の地物を対象とする Expression
  //       filter: ['==', ['get', 'amenity'], 'university'],
  //       paint: {
  //         'circle-radius': 10,
  //         'circle-color': [
  //           'case',
  //           ['<=', ['get', 'published_year'], 1900],
  //           '#ff0000', // 1900年以前に創立された大学は赤色
  //           '#00ff00'  // それ以外は緑色
  //         ],
  //         'circle-opacity': 1.0,
  //         'circle-stroke-color': '#000000',
  //         'circle-stroke-width': 2,
  //         'circle-stroke-opacity': 1.0
  //       },
  //     },

  //     // Expression の 例（大学ラベル）
  //     {
  //       id: 'university-layer',
  //       type: 'symbol',
  //       source: 'geojson-sample-source-1',
  //       // amenity プロパティが university の地物を対象とする Expression
  //       filter: ['==', ['get', 'amenity'], 'university'],
  //       layout: {
  //         'text-field': [
  //           // 文字列を連結する Expression
  //           'concat',
  //           ['get', 'name:en'],
  //           '\n',
  //           '（',
  //           ['get', 'name'],
  //           '）',
  //           '\n',
  //           '明治',
  //           [
  //             // 数字を文字列に変換する Expression
  //             'to-string',
  //             [
  //               // 西暦から和暦に変換する減算の Expression
  //               '-',
  //               ['get', 'published_year'],
  //               1867,
  //             ],
  //           ],
  //           '年創立',
  //         ],
  //         'text-size': 12,
  //         'text-offset': [0, 5],
  //         'text-anchor': 'bottom',
  //       },
  //       paint: {
  //         'text-color': '#3333ff',
  //         'text-halo-color': '#ffffff',
  //         'text-halo-width': 2,
  //       },
  //     },
  //   ]
  // },
    ],
  },
  // center: 地図の初期表示位置を経度・緯度で指定
  // [経度, 緯度] の順番で指定します
  center: [135.7681, 35.0116], // 京都市周辺

  // zoom: 地図の初期ズームレベルを指定
  // 数値が大きいほど拡大表示されます
  zoom: 12,

  // hash: URLのハッシュ部分に地図の位置情報を反映させるかどうか
  hash: true,

  maxZoom: 18,
  minZoom: 4,
});

// クリックした時のインタラクション（バス停または大学に反応）
map.on('click', function (e) {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['bus-point-layer', 'ritsumeikan-icon-layer', 'university-layer']
  });
  if (features.length > 0) {
    const feature = features[0];
    const label = feature.properties.name || feature.properties.P11_011 || feature.properties.P11_004 || '地物';
    alert('クリックした地物:\n' + label);
  }
});

