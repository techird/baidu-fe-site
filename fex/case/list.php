<?php
  error_reporting(E_ERROR);

  function listCases( $path = null ) {

    if($path == null) $path = getcwd();
    $case_path = $path.'/cases';
    $dir = dir($case_path);
    $list = array();
    $maxLevel = 0;

    while($child = $dir -> read()) {
      if($child != '.' && $child != '..')
        $list[$child] = getCase( $case_path.'/'.$child );
    } 
    return $list;
  }

  function findMaxLevel($level) {
    global $maxLevel;
    if($level > $maxLevel) $maxLevel = $level;
  }

  function filterByTopic( $case ) {
    return $case['topic'] == $_REQUEST['topic'];
  }

  function getCase($path) {
    $file = $path.'/index.html';
    $content = file_get_contents($file);
    $result = array();

    preg_match('/<title>(.+?)<\\/title>/', $content, $match);
    $result['title'] = $match[1];
    $result['tags'] = getMeta($content, 'tags');
    $result['desc'] = getMeta($content, 'desc');
    $result['topic'] = getMeta($content, 'topic');
    $result['level'] = getMeta($content, 'level');

    findMaxLevel($result['level']);

    return $result;
  }

  function getMeta($content, $name) {
    preg_match('/<meta name="case-'.$name.'" content="(.+?)">/', $content, $match);
    return $match[1];
  }

  if( $_REQUEST['a'] == 'maxlevel' ) {
    echo "Max Level: <span style='color: red;'>$maxLevel</span>";
  } 

  elseif ( $_REQUEST['topic'] ) {
    $list = listCases();
    $list = array_filter($list, filterByTopic);   
    header('Content-Type:application/json');
    echo json_encode($list);
  } 

?>