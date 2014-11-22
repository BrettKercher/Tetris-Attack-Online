<?php
/**
 * Created by PhpStorm.
 * User: Brett
 * Date: 11/17/2014
 * Time: 5:09 PM
 */

class GameController extends BaseController
{
    public $restful = true;

    public function showSurvival()
    {
        return View::make('play')
            ->with('title', 'Survival')
            ->with('user', Auth::user());
    }
}
