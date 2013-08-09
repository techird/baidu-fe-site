<?php
  error_reporting(E_ERROR);
  $path = getcwd();
  $case_path = $path.'\\cases';
  $dir = dir($case_path);
  $list = array();
  while($child = $dir -> read()) {
    if($child != '.' && $child != '..')
      $list[$child] = getCase( $case_path.'\\'.$child );
  }
  header('Content-Type:application/json');
  echo json_encode($list);
  function getCase($path) {
    $file = $path.'\\index.html';
    $content = file_get_contents($file);
    $result = array();

    preg_match('/<title>(.+?)<\\/title>/', $content, $match);
    $result['title'] = $match[1];

    $result['tags'] = getMeta($content, 'tags');
    $result['desc'] = getMeta($content, 'desc');

    return $result;
  }
  function getMeta($content, $name) {
    preg_match('/<meta name="case-'.$name.'" content="(.+?)">/', $content, $match);
    return $match[1];
  }
?>