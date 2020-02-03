window.addEventListener('DOMContentLoaded', (event) => {
  var WalletConnect = window.WalletConnect.default;
  var WalletConnectQRCodeModal = window.WalletConnectQRCodeModal.default;

  var api = axios.create({
    baseURL: 'https://ethereum-api.xyz',
    timeout: 30000, // 30 secs
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  var getAccountAssets = function (address, chainId) {
    document.getElementById('assets').innerHTML = 'Loading assets...';
    var response = api.get(
      `/account-assets?address=${address}&chainId=${chainId}`
    ).then(response => {
      assetList(response.data.result);
    });
  }

  var assetList = function (assets) {
    var result = '<table><tr><th>ASSET</th><th>BALANCE</th>';
    for (var a of assets) {
      result = result + '<tr><td>' + a.symbol + '</td><td>' + a.balance + '</td>';
    }
    result = result + '</table>';
    document.getElementById('assets').innerHTML = result;
  }

  var displayData = function () {
    document.getElementById('connect').firstChild.data = 'Disconnect';
    document.getElementById('data').hidden = false;
    document.getElementById('assets').hidden = false;
    document.getElementById('account').innerHTML = walletConnector.accounts[0];
    document.getElementById('chainId').innerHTML = walletConnector.chainId;
    getAccountAssets(walletConnector.accounts[0], walletConnector.chainId);
  }


  var walletConnector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org' // Required
  });

  if (walletConnector.connected) {
    displayData();
  }

  connect = function () {
    // Check if connection is already established
    if (!walletConnector.connected) {
      // create new session
      walletConnector.createSession().then(() => {
        // get uri for QR Code modal
        var uri = walletConnector.uri;
        // display QR Code modal
        WalletConnectQRCodeModal.open(uri, () => {
          console.log('QR Code Modal closed');
        });
      });
    } else {
      walletConnector.killSession();
    }
  }

  // Subscribe to connection events
  walletConnector.on('connect', function (error, payload) {
    if (error) {
      console.error(error);
    } else {
      // Close QR Code Modal
      WalletConnectQRCodeModal.close();
      displayData();
    }
  });

  walletConnector.on('session_update', function (error, payload) {
    if (error) {
      console.error(error);
    } else if (walletConnector.connected) {
      displayData();
    }

  });

  walletConnector.on('disconnect', function (error, payload) {
    if (error) {
      console.error(error);
    } else {
      document.getElementById('connect').firstChild.data = 'Connect';
      document.getElementById('data').hidden = true;
      document.getElementById('assets').hidden = true;
      document.getElementById('account').innerHTML = '';
      document.getElementById('chainId').innerHTML = '';
    }
  });

});
