var cheerio = require('cheerio');

function parseHTML(data) {
    data = addClosingTags(data);

    var $ = cheerio.load(data);
    var $node = $('a');

    var list = [];

    $node.each(function(index, a) {
      var $a = $(a);
      var item = extractItem($a);
      list.push(item);
    });

    return list
}

function addClosingTags(data) {
    var lines = data.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      // Starts with <DT and ends with </A>
      if (/^\s*\<DT.+\<\/A\>\s*$/i.test(lines[i])) {
        lines[i] = lines[i] + '</DT>';
      }
      // Starts with <DD and doesn't ends with </DD>
      else if (/^\s*<DD.+((?!\<\/DD\>).)*$/i.test(lines[i])) {
        lines[i] = lines[i] + '</DD>';
      }
    }
    return lines.join('\n');
}

function extractItem($a) {
  var title = $a.text();
  var href = $a.attr('href');
  var icon = $a.attr('icon');
  var domain = extractDomain(href);
  var attribs = $a.length > 0 ? $a[0].attribs : {};
  var folders = getFolders($a);

  var $dd = $a.closest('DT').next('DD')
  var note = $dd.text();

  var item = {
    title: title,
    note: note,
    href: href,
    valid_url: isValidUrl(href),
    domain: domain,
    icon: icon,
    attribs: attribs,
    folders: folders,
  };

  delete item.attribs.href;
  delete item.attribs.icon;

  return item;
}

function getFolders($a) {
  var $node = $a.closest('DL').prev();
  if ($node.length == 0) {
    $node = $a.closest('ul').prev();
  }

  var title = $node.text();
  var htmlTag = $node.length > 0 ? $node[0].name : '';
  var attribs = $node.length > 0 ? $node[0].attribs : {};

  var folder = {
    title: title,
    attribs: attribs,
  }

  // Ignore folder with no title
  if ($node.length > 0 && folder.title.length > 0) {
    return [folder].concat(getFolders($node));
  } else {
    return [];
  }
}

function extractDomain(url) {
  if (! /^[a-z]+:\/\//.test(url)) {
    return '';
  }

  var domain;
  if (url.indexOf("://") > -1) {
      domain = url.split('/')[2];
  } else {
      domain = url.split('/')[0];
  }

  return domain;
}

function isValidUrl(url) {
  // Based on https://github.com/jzaefferer/jquery-validation/blob/master/src/core.js
  // Copyright (c) 2010-2013 Diego Perini, MIT licensed
  // https://gist.github.com/dperini/729294
  // see also https://mathiasbynens.be/demo/url-regex
  // modified to allow protocol-relative URLs
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

module.exports = parseHTML;
