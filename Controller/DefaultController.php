<?php

namespace Os2Display\HorizonTemplateBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('Os2DisplayHorizonTemplateBundle:Default:index.html.twig', array('name' => $name));
    }
}
