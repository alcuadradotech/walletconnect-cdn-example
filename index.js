window.addEventListener('DOMContentLoaded', (event) => {
  var WalletConnect = window.WalletConnect.default;
  var WalletConnectQRCodeModal = window.WalletConnectQRCodeModal.default;

  // Setup the image in base64 format (declared intrust-wallet-connect-img.js)
  // this allows to simply open the index.html file in the browser (without
  // the need of a server)
  document.getElementById('trust-wallet-connect').src = trustWalletConnectImg;

  // This is an Ethereum API for retriving data from the blockchain using
  //  the axios package.
  var api = axios.create({
    baseURL: 'https://ethereum-api.xyz',
    timeout: 30000, // 30 secs
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  // Get accounts
  var getAccountAssets = function (address, chainId) {
    document.getElementById('assets').innerHTML = 'Loading assets...';
    var response = api.get(
      `/account-assets?address=${address}&chainId=${chainId}`
    ).then(response => {
      assetList(response.data.result);
    });
  }

  // Create the list of assets
  var assetList = function (assets) {
    var result = '<table><tr><th>ASSET</th><th>BALANCE</th>';
    for (var a of assets) {
      result = result + '<tr><td>' + a.symbol + '</td><td>' + a.balance + '</td>';
    }
    result = result + '</table>';
    document.getElementById('assets').innerHTML = result;
  }

  // Display all
  var displayData = function () {
    document.getElementById('connect').firstChild.data = 'Disconnect';
    document.getElementById('data').hidden = false;
    document.getElementById('assets').hidden = false;
    document.getElementById('account').innerHTML = walletConnector.accounts[0];
    document.getElementById('chainId').innerHTML = walletConnector.chainId;
    getAccountAssets(walletConnector.accounts[0], walletConnector.chainId);
  }


  // Get an instance of the WalletConnect connector
  var walletConnector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org' // Required
  });

  // Display data if connected
  if (walletConnector.connected) {
    displayData();
  }

  // When the connect/disconnect button is clicked
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
      // disconnect
      walletConnector.killSession();
    }
  }

  // Subscribe to connection events: connect, session_update and disconnect
  walletConnector.on('connect', function (error, payload) {
    if (error) {
      console.error(error);
    } else {
      // Close QR Code Modal
      WalletConnectQRCodeModal.close();
      // connection is made so we can display all the data
      displayData();
    }
  });

  walletConnector.on('session_update', function (error, payload) {
    if (error) {
      console.error(error);
    } else if (walletConnector.connected) {
      // data may be changed
      displayData();
    }

  });

  walletConnector.on('disconnect', function (error, payload) {
    if (error) {
      console.error(error);
    } else {
      // remove all the data
      document.getElementById('connect').firstChild.data = 'Connect';
      document.getElementById('data').hidden = true;
      document.getElementById('assets').hidden = true;
      document.getElementById('account').innerHTML = '';
      document.getElementById('chainId').innerHTML = '';
    }
  });

});
