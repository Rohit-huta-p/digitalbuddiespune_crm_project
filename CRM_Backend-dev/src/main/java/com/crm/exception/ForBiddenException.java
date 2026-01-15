package com.crm.exception;

public class ForBiddenException extends RuntimeException  {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8008999967558863061L;
	String message;

	public ForBiddenException(String message) 
	{
        super(message);
    }

}
